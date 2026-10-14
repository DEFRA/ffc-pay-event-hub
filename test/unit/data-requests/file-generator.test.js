const { PassThrough } = require('node:stream')
const QueryStream = require('pg-query-stream')

jest.mock('pg-query-stream', () =>
  jest.fn().mockImplementation(() => ({}))
)

jest.mock('../../../app/storage')
jest.mock('../../../app/data-requests/utils/generate-unique-filename')

const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['payments', 'paymentFrnEvents'])
mockDb.knex.client = {
  acquireConnection: jest.fn(),
  releaseConnection: jest.fn()
}

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const storage = require('../../../app/storage')
const {
  generateUniqueFilename
} = require('../../../app/data-requests/utils/generate-unique-filename')

const {
  generateSqlQuery,
  exportQueryToJsonFile
} = require('../../../app/data-requests/file-generator')

describe('file-generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateSqlQuery', () => {
    beforeEach(() => {
      mockDb.builder.toQuery = jest.fn(() => 'select * from "payments"')
    })

    test('returns the query for the table accessor without a where clause when none supplied', () => {
      const result = generateSqlQuery(null, 'payments')

      expect(mockDb.tables.payments).toHaveBeenCalledWith()
      expect(mockDb.builder.where).not.toHaveBeenCalled()
      expect(mockDb.builder.orderBy).not.toHaveBeenCalled()
      expect(result).toBe('select * from "payments"')
    })

    test('applies the where clause', () => {
      const result = generateSqlQuery({ category: 'frn', type: 'x' }, 'payments')

      expect(mockDb.builder.where).toHaveBeenCalledWith({ category: 'frn', type: 'x' })
      expect(result).toBe('select * from "payments"')
    })

    test('uses the accessor for the requested table', () => {
      generateSqlQuery({ frn: '1234567890' }, 'paymentFrnEvents')

      expect(mockDb.tables.paymentFrnEvents).toHaveBeenCalledWith()
      expect(mockDb.tables.payments).not.toHaveBeenCalled()
    })

    test('adds order by clauses in the order given with normalised directions', () => {
      generateSqlQuery(
        null,
        'paymentFrnEvents',
        [['schemeId', 'asc'], ['lastUpdated', 'DESC']]
      )

      expect(mockDb.builder.orderBy).toHaveBeenNthCalledWith(1, 'schemeId', 'asc')
      expect(mockDb.builder.orderBy).toHaveBeenNthCalledWith(2, 'lastUpdated', 'desc')
    })

    test('throws if table not found', () => {
      expect(() => {
        generateSqlQuery(null, 'missing')
      }).toThrow("Table model 'missing' not found in database")
    })

    test.each(['client', 'transaction', 'close', 'toString'])(
      'throws for %s, which is not a table',
      (name) => {
        expect(() => {
          generateSqlQuery(null, name)
        }).toThrow(`Table model '${name}' not found in database`)
      }
    )

    test('throws if orderBy not array', () => {
      expect(() => {
        generateSqlQuery(null, 'payments', 'id')
      }).toThrow(TypeError)
    })

    test('throws for invalid column', () => {
      expect(() => {
        generateSqlQuery(null, 'payments', [['bad', 'ASC']])
      }).toThrow('Invalid order column: bad')
    })

    test('throws for a column that belongs to a different table', () => {
      expect(() => {
        generateSqlQuery(null, 'payments', [['lastUpdated', 'ASC']])
      }).toThrow('Invalid order column: lastUpdated')
    })

    test('throws for invalid direction', () => {
      expect(() => {
        generateSqlQuery(null, 'payments', [['id', 'SIDEWAYS']])
      }).toThrow('Invalid order direction: SIDEWAYS')
    })
  })

  describe('exportQueryToJsonFile', () => {
    let pgStream
    let mockClient
    let rowProcessor

    beforeEach(() => {
      pgStream = new PassThrough({ objectMode: true })

      mockClient = {
        query: jest.fn(() => pgStream)
      }

      mockDb.knex.client.acquireConnection.mockResolvedValue(mockClient)
      mockDb.knex.client.releaseConnection.mockResolvedValue()

      generateUniqueFilename.mockReturnValue('generated-file.json')

      // 👇 IMPORTANT: actively drain stream
      storage.streamDataRequestFile.mockImplementation(
        (_filename, stream) => {
          stream.resume()
          return Promise.resolve()
        }
      )

      rowProcessor = jest.fn((row, output, firstFlag) => {
        if (firstFlag.value) {
          firstFlag.value = false
        } else {
          output.write(',\n')
        }
        output.write(JSON.stringify(row))
      })
    })

    const emit = (event, payload) => {
      process.nextTick(() => {
        pgStream.emit(event, payload)
      })
    }

    test('streams rows and writes JSON array with defaults', async () => {
      const promise = exportQueryToJsonFile(
        'SELECT 1',
        rowProcessor,
        'report-id'
      )

      emit('data', { id: 1 })
      emit('data', { id: 2 })
      emit('end')

      const filename = await promise

      expect(filename).toBe('generated-file.json')
      expect(generateUniqueFilename).toHaveBeenCalledWith('report-id')
      expect(QueryStream).toHaveBeenCalledWith(
        'SELECT 1',
        [],
        { batchSize: 5000 }
      )
      expect(rowProcessor).toHaveBeenCalledTimes(2)
      expect(mockDb.knex.client.acquireConnection).toHaveBeenCalledTimes(1)
      expect(mockDb.knex.client.releaseConnection).toHaveBeenCalledWith(mockClient)
    })

    test('uses custom streamOptions', async () => {
      const customOptions = {
        onStart: jest.fn(),
        onEnd: jest.fn((stream) => {
          stream.end()
        })
      }

      const promise = exportQueryToJsonFile(
        'SELECT 1',
        rowProcessor,
        'custom',
        customOptions
      )

      emit('end')
      await promise

      expect(customOptions.onStart).toHaveBeenCalledTimes(1)
      expect(customOptions.onEnd).toHaveBeenCalledTimes(1)
    })

    test('passes batchSize to QueryStream', async () => {
      const promise = exportQueryToJsonFile(
        'SELECT 1',
        rowProcessor,
        'batch-test',
        undefined,
        1234
      )

      emit('end')
      await promise

      expect(QueryStream).toHaveBeenCalledWith(
        'SELECT 1',
        [],
        { batchSize: 1234 }
      )
    })

    test('propagates storage errors and releases connection', async () => {
      storage.streamDataRequestFile.mockRejectedValue(
        new Error('Upload failed')
      )

      const promise = exportQueryToJsonFile(
        'SELECT 1',
        rowProcessor
      )

      emit('end')

      await expect(promise).rejects.toThrow('Upload failed')

      expect(mockDb.knex.client.acquireConnection).toHaveBeenCalledTimes(1)
      expect(mockDb.knex.client.releaseConnection).toHaveBeenCalledWith(mockClient)
    })

    test('propagates pgStream error', async () => {
      const promise = exportQueryToJsonFile(
        'SELECT 1',
        rowProcessor
      )

      emit('error', new Error('DB fail'))

      await expect(promise).rejects.toThrow('DB fail')
    })
  })
})

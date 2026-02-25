const { PassThrough } = require('node:stream')
const QueryStream = require('pg-query-stream')

jest.mock('pg-query-stream', () =>
  jest.fn().mockImplementation(() => ({}))
)

jest.mock('../../../app/storage')
jest.mock('../../../app/data-requests/utils/generate-unique-filename')

const mockGetWhereConditions = jest.fn(() => 'id = 1')

const mockPaymentsModel = {
  getTableName: () => 'mock_table',
  rawAttributes: {
    id: {},
    name: {}
  }
}

jest.mock('../../../app/data', () => ({
  sequelize: {
    connectionManager: {
      getConnection: jest.fn(),
      releaseConnection: jest.fn()
    },
    getQueryInterface: jest.fn(() => ({
      queryGenerator: {
        getWhereConditions: mockGetWhereConditions
      }
    }))
  },
  payments: mockPaymentsModel
}))

const db = require('../../../app/data')
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
    test.each([
      [null, null, 'SELECT * FROM mock_table'],
      [{ id: 1 }, null, 'SELECT * FROM mock_table WHERE id = 1']
    ])(
      'builds query with whereClause %p',
      (whereClause, orderBy, expected) => {
        const result = generateSqlQuery(
          whereClause,
          'payments',
          orderBy
        )

        expect(result).toBe(expected)
      }
    )

    test('adds ORDER BY clause', () => {
      const result = generateSqlQuery(
        null,
        'payments',
        [['id', 'asc'], ['name', 'DESC']]
      )

      expect(result).toBe(
        'SELECT * FROM mock_table ORDER BY "id" ASC, "name" DESC'
      )
    })

    test('throws if table not found', () => {
      expect(() => {
        generateSqlQuery(null, 'missing')
      }).toThrow("Table model 'missing' not found in database")
    })

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

      db.sequelize.connectionManager.getConnection.mockResolvedValue(
        mockClient
      )
      db.sequelize.connectionManager.releaseConnection.mockResolvedValue()

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
      expect(
        db.sequelize.connectionManager.releaseConnection
      ).toHaveBeenCalledWith(mockClient)
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

      expect(
        db.sequelize.connectionManager.releaseConnection
      ).toHaveBeenCalledWith(mockClient)
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

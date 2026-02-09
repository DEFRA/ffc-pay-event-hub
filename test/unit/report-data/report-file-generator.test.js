const { PassThrough } = require('stream')
const QueryStream = require('pg-query-stream')

jest.mock('pg-query-stream')
jest.mock('../../../app/storage')

// Mock the database module fully
const mockPaymentsModel = { getTableName: () => 'mock_table' }
const mockGetWhereConditions = jest.fn((where, tableName) => (where ? 'id = 1' : ''))

jest.mock('../../../app/data', () => ({
  sequelize: {
    connectionManager: {
      getConnection: jest.fn(),
      releaseConnection: jest.fn()
    },
    getQueryInterface: jest.fn(() => ({
      queryGenerator: { getWhereConditions: mockGetWhereConditions }
    }))
  },
  payments: mockPaymentsModel
}))

// ----------------------
// IMPORT AFTER MOCKS
// ----------------------
const db = require('../../../app/data')
const storage = require('../../../app/storage')
const { generateSqlQuery, exportQueryToJsonFile } = require('../../../app/report-data/report-file-generator')

// =======================
// TESTS
// =======================
describe('report-file-generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateSqlQuery', () => {
    test.each([
      [null, 'SELECT * FROM mock_table'],
      [{ id: 1 }, 'SELECT * FROM mock_table WHERE id = 1']
    ])('returns correct query for whereClause %p', (whereClause, expected) => {
      const result = generateSqlQuery(whereClause, 'payments')
      expect(result).toBe(expected)
    })

    test('throws error if tableName not found', () => {
      expect(() => generateSqlQuery(null, 'nonexistent')).toThrow(
        "Table model 'nonexistent' not found in database"
      )
    })
  })

  describe('exportQueryToJsonFile', () => {
    let pgStream
    let mockClient

    beforeEach(() => {
      pgStream = new PassThrough({ objectMode: true })
      mockClient = { query: jest.fn(() => pgStream) }

      db.sequelize.connectionManager.getConnection.mockResolvedValue(mockClient)
      db.sequelize.connectionManager.releaseConnection.mockResolvedValue()

      storage.writeReportFile.mockImplementation((_filename, stream) => {
        stream.on('data', () => {})
        return new Promise((resolve, reject) => {
          stream.on('end', resolve)
          stream.on('error', reject)
        })
      })
    })

    test('exports query results to storage as JSON array', async () => {
      const exportPromise = exportQueryToJsonFile('SELECT * FROM mock_table', 'test-report', 100)

      process.nextTick(() => {
        pgStream.emit('data', { id: 1, name: 'Alice' })
        pgStream.emit('data', { id: 2, name: 'Bob' })
        pgStream.emit('end')
      })

      const filename = await exportPromise

      expect(filename).toMatch(/^test-report-\d{4}-\d{2}-\d{2}T/)
      expect(mockClient.query).toHaveBeenCalledWith(expect.any(QueryStream))
      expect(storage.writeReportFile).toHaveBeenCalled()
      expect(db.sequelize.connectionManager.getConnection).toHaveBeenCalled()
      expect(db.sequelize.connectionManager.releaseConnection).toHaveBeenCalled()
    })

    test('throws error if storage.writeReportFile rejects', async () => {
      const error = new Error('Upload failed')
      storage.writeReportFile.mockRejectedValue(error)

      process.nextTick(() => {
        pgStream.emit('data', { id: 1 })
        pgStream.emit('end')
      })

      await expect(exportQueryToJsonFile('SELECT * FROM mock_table', 'fail-report', 100)).rejects.toThrow('Upload failed')
      expect(db.sequelize.connectionManager.releaseConnection).toHaveBeenCalled()
    })
  })
})

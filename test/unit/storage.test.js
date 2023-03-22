jest.mock('../../app/config/storage')
const mockConfig = require('../../app/config/storage')

const mockTableClient = {
  createTable: jest.fn()
}
jest.mock('@azure/data-tables', () => {
  return {
    TableClient: {
      fromConnectionString: jest.fn().mockReturnValue(mockTableClient)
    }
  }
})
jest.mock('@azure/identity')

const { initialiseTables, getClient } = require('../../app/storage')

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfig.useConnectionString = true
    mockConfig.connectionString = 'test-connection-string'
    mockConfig.paymentTable = 'payments'
    mockConfig.batchTable = 'batches'
    mockConfig.holdTable = 'holds'
    mockConfig.warningTable = 'warnings'
  })

  test('should create payment table from connection string if use connection string true', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(mockConfig.paymentTable)
  })

  test('should create batches table from connection string if use connection string true', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(mockConfig.batchTable)
  })

  test('should create hold table from connection string if use connection string true', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(mockConfig.holdTable)
  })

  test('should create warning table from connection string if use connection string true', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(mockConfig.warningTable)
  })

  test('should create warning table from connection string once per table if use connection string true', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledTimes(4)
  })
})

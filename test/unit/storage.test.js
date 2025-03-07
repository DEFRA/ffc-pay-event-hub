const config = require('../../app/config/storage')
const { PAYMENT_EVENT, BATCH_EVENT, HOLD_EVENT, WARNING_EVENT } = require('../../app/constants/event-types')

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
  })

  test('should create payment table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.paymentTable)
  })

  test('should create batches table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.batchTable)
  })

  test('should create hold table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.holdTable)
  })

  test('should create warning table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.warningTable)
  })

  test('should create each table once', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledTimes(4)
  })

  test('getClient should return payment client if payment event', async () => {
    await initialiseTables()
    const client = getClient(PAYMENT_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should return batch client if payment event', async () => {
    await initialiseTables()
    const client = getClient(BATCH_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should return hold client if payment event', async () => {
    await initialiseTables()
    const client = getClient(HOLD_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should return warning client if payment event', async () => {
    await initialiseTables()
    const client = getClient(WARNING_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should throw error for unknown event', async () => {
    await initialiseTables()
    expect(() => getClient('unknown')).toThrow()
  })
})

describe('TabelClient initialization', () => {
  let consoleLogSpy
  let config
  let DefaultAzureCredential
  let TableClient

  beforeAll(() => {
    jest.doMock('@azure/identity', () => ({
      DefaultAzureCredential: jest.fn().mockImplementation((options) => ({
        type: 'DefaultAzureCredential',
        options
      }))
    }))
  })

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    config = require('../../app/config/storage')
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    TableClient = require('@azure/data-tables')
    DefaultAzureCredential = require('@azure/identity')
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    jest.clearAllMocks()
  })

  test('should use connection string when config.useConnectionStr is true', () => {
    config.useConnectionStr = true
    config.connectionStr = 'fake-connection-string'

    require('../../app/storage')

    expect(consoleLogSpy).toHaveBeenCalledWith('Using connection string for Table Client')
    expect(TableClient.fromConnectionString).toHaveBeenCalledWith(config.connectionStr)
  })

  test('should use DefaultAzureCredential when config.useConnectionStr is false', () => {
    config.useConnectionStr = false
    config.storageAccount = 'fakeaccount'
    config.managedIdentityClientId = 'fake-managed-id'

    require('../../app/storage')

    const expectedUri = `https://${config.storageAccount}.blob.core.windows.net`

    expect(consoleLogSpy).toHaveBeenCalledWith('Using DefaultAzureCredential for Table Client')
    expect(DefaultAzureCredential).toHaveBeenCalledWith({ managedIdentityClientId: config.managedIdentityClientId })
    expect(TableClient).toHaveBeenCalledWith(expectedUri,
      expect.objectContaining({
        type: 'DefaultAzureCredential',
        options: { managedIdentityClientId: config.managedIdentityClientId }
      })
    )
  })
})

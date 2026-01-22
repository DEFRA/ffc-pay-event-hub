const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } =
  require('../../app/constants/event-types')

jest.mock('@azure/storage-blob', () => {
  const upload = jest.fn().mockResolvedValue()
  const getBlockBlobClient = jest.fn(() => ({ upload }))
  const createIfNotExists = jest.fn().mockResolvedValue()

  const getContainerClient = jest.fn(() => ({
    createIfNotExists,
    getBlockBlobClient
  }))

  const fromConnectionString = jest.fn(() => ({ getContainerClient }))

  const BlobServiceClient = jest.fn(() => ({ getContainerClient }))
  BlobServiceClient.fromConnectionString = fromConnectionString

  return { BlobServiceClient }
})

jest.mock('@azure/identity', () => ({
  DefaultAzureCredential: jest.fn().mockImplementation((opts) => ({ opts }))
}))

jest.mock('@azure/data-tables', () => {
  const createTable = jest.fn().mockResolvedValue()
  const TableClient = jest.fn(() => ({ createTable }))
  TableClient.fromConnectionString = jest.fn(() => ({ createTable }))

  return { TableClient, odata: {} }
})

jest.mock('../../app/messaging/send-alert', () => ({
  sendAlert: jest.fn()
}))

describe('Storage module', () => {
  let storage
  let storageConfig
  let sendAlert
  let TableClient
  let BlobServiceClient
  let DefaultAzureCredential
  let consoleLogSpy
  let consoleErrorSpy

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    storageConfig = require('../../app/config/storage')
    storage = require('../../app/storage')
    sendAlert = require('../../app/messaging/send-alert').sendAlert
    ;({ TableClient } = require('@azure/data-tables'))
    ;({ BlobServiceClient } = require('@azure/storage-blob'))
    ;({ DefaultAzureCredential } = require('@azure/identity'))

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('initialise', () => {
    test('uses connection string when configured', async () => {
      storageConfig.useConnectionString = true
      storageConfig.connectionString = 'fake-connection-string'

      await storage.initialise()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Using connection string for Table & Storage Clients'
      )
      expect(BlobServiceClient.fromConnectionString).toHaveBeenCalled()
      expect(TableClient.fromConnectionString).toHaveBeenCalledTimes(4)
    })

    test('uses DefaultAzureCredential when configured', async () => {
      storageConfig.useConnectionString = false
      storageConfig.account = 'fakeaccount'
      storageConfig.managedIdentityClientId = 'fake-id'

      await storage.initialise()

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Using DefaultAzureCredential for Table & Storage Clients'
      )
      expect(DefaultAzureCredential).toHaveBeenCalledWith({
        managedIdentityClientId: 'fake-id'
      })
      expect(TableClient).toHaveBeenCalledTimes(4)
      expect(BlobServiceClient).toHaveBeenCalledTimes(1)
    })

    test('creates tables and blob containers when createEntities is true', async () => {
      storageConfig.useConnectionString = true
      storageConfig.createEntities = true

      await storage.initialise()

      expect(consoleLogSpy).toHaveBeenCalledWith('Making sure tables exist')
      expect(consoleLogSpy).toHaveBeenCalledWith('Making sure blob containers exist')
      expect(consoleLogSpy).toHaveBeenCalledWith('Storage ready')
    })
  })

  describe('initialiseTables', () => {
    test('initialises tables using DefaultAzureCredential', async () => {
      storageConfig.useConnectionString = false

      await storage.initialiseTables()

      expect(TableClient).toHaveBeenCalledTimes(4)
      expect(TableClient.fromConnectionString).not.toHaveBeenCalled()
    })

    test('initialises tables using connection string', async () => {
      storageConfig.useConnectionString = true

      await storage.initialiseTables()

      expect(TableClient.fromConnectionString).toHaveBeenCalledTimes(4)
    })
  })

  describe('getClient', () => {
    test.each([
      PAYMENT_EVENT,
      HOLD_EVENT,
      WARNING_EVENT,
      BATCH_EVENT
    ])('returns client for %s', async (eventType) => {
      await storage.initialise()
      expect(storage.getClient(eventType)).toBeDefined()
    })

    test('throws for unknown event type', async () => {
      await storage.initialise()
      expect(() => storage.getClient('UNKNOWN')).toThrow(
        'Unknown event type: UNKNOWN'
      )
    })
  })

  describe('blob helpers', () => {
    test('writeFile uploads blob', async () => {
      await storage.initialise()
      await storage.writeFile('test.txt', 'hello')

      const container = BlobServiceClient.fromConnectionString()
        .getContainerClient()

      expect(container.getBlockBlobClient).toHaveBeenCalledWith('test.txt')
    })

    test('writeDataRequestFile uploads and returns blob client', async () => {
      await storage.initialise()
      const blob = await storage.writeDataRequestFile('data.json', '{}')

      expect(blob).toBeDefined()
      expect(blob.upload).toHaveBeenCalled()
    })
  })
})

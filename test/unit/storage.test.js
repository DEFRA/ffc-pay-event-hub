const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('../../app/constants/event-types')

describe('Storage initialization and functionality', () => {
  let consoleLogSpy
  let storageConfig
  let BlobServiceClient
  let DefaultAzureCredential
  let TableClient
  let storage

  beforeAll(() => {
    jest.doMock('@azure/storage-blob', () => {
      const getBlockBlobClientMock = jest.fn().mockReturnValue({ upload: jest.fn().mockResolvedValue() })
      const getContainerClientMock = jest.fn().mockReturnValue({
        createIfNotExists: jest.fn().mockResolvedValue(),
        getBlockBlobClient: getBlockBlobClientMock
      })
      const fromConnectionStringMock = jest.fn().mockReturnValue({ getContainerClient: getContainerClientMock })
      const BlobServiceClientMock = jest.fn().mockImplementation(() => ({ getContainerClient: getContainerClientMock }))
      BlobServiceClientMock.fromConnectionString = fromConnectionStringMock
      return { BlobServiceClient: BlobServiceClientMock }
    })

    jest.doMock('@azure/identity', () => ({
      DefaultAzureCredential: jest.fn().mockImplementation((options) => ({ type: 'DefaultAzureCredential', options }))
    }))

    jest.doMock('@azure/data-tables', () => {
      const createTableMock = jest.fn().mockResolvedValue()
      const TableClientMock = jest.fn().mockImplementation(() => ({ createTable: createTableMock }))
      TableClientMock.fromConnectionString = jest.fn().mockReturnValue({ createTable: createTableMock })
      return { TableClient: TableClientMock, odata: {} }
    })
  })

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    storageConfig = require('../../app/config/storage')
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    ;({ BlobServiceClient } = require('@azure/storage-blob'))
    ;({ DefaultAzureCredential } = require('@azure/identity'))
    ;({ TableClient } = require('@azure/data-tables'))
    storage = require('../../app/storage')
  })

  afterEach(() => consoleLogSpy.mockRestore())

  test('should use connection string when storageConfig.useConnectionString is true', async () => {
    storageConfig.useConnectionString = true
    storageConfig.connectionString = 'fake-connection-string'

    await storage.initialise()

    expect(consoleLogSpy).toHaveBeenCalledWith('Using connection string for Table & Storage Clients')
    expect(BlobServiceClient.fromConnectionString).toHaveBeenCalledWith(storageConfig.connectionString)
    expect(TableClient.fromConnectionString).toHaveBeenCalledTimes(4)
  })

  test('should use DefaultAzureCredential when storageConfig.useConnectionString is false', async () => {
    storageConfig.useConnectionString = false
    storageConfig.account = 'fakeaccount'
    storageConfig.managedIdentityClientId = 'fake-managed-id'

    await storage.initialise()

    const expectedBlobUri = `https://${storageConfig.account}.blob.core.windows.net`
    const expectedTableUri = `https://${storageConfig.account}.table.core.windows.net`

    expect(consoleLogSpy).toHaveBeenCalledWith('Using DefaultAzureCredential for Table & Storage Clients')
    expect(DefaultAzureCredential).toHaveBeenCalledWith({ managedIdentityClientId: storageConfig.managedIdentityClientId })
    expect(BlobServiceClient).toHaveBeenCalledWith(expectedBlobUri, expect.any(Object))
    expect(TableClient).toHaveBeenCalledTimes(4)
    expect(TableClient).toHaveBeenCalledWith(expectedTableUri, expect.any(String), expect.any(Object))
  })

  test('should create tables and container when createEntities is true', async () => {
    storageConfig.createEntities = true
    storageConfig.useConnectionString = true
    storageConfig.connectionString = 'fake-connection-string'

    await storage.initialise()

    expect(consoleLogSpy).toHaveBeenCalledWith('Making sure tables exist')
    expect(consoleLogSpy).toHaveBeenCalledWith('Making sure blob containers exist')
    expect(consoleLogSpy).toHaveBeenCalledWith('Storage ready')
    expect(TableClient.fromConnectionString().createTable).toHaveBeenCalledTimes(4)
    expect(BlobServiceClient.fromConnectionString().getContainerClient().createIfNotExists).toHaveBeenCalled()
  })

  describe('getClient', () => {
    const events = [
      [PAYMENT_EVENT, 'paymentClient'],
      [HOLD_EVENT, 'holdClient'],
      [WARNING_EVENT, 'warningClient'],
      [BATCH_EVENT, 'batchClient']
    ]

    test.each(events)('should return a client for %s', async (eventType) => {
      await storage.initialise()
      const client = storage.getClient(eventType)
      expect(client).toBeDefined()
    })

    test('should throw error for unknown event type', async () => {
      await storage.initialise()
      expect(() => storage.getClient('UNKNOWN_EVENT')).toThrow('Unknown event type: UNKNOWN_EVENT')
    })
  })

  describe('writeFile and writeDataRequestFile', () => {
    test('should write file to blob storage', async () => {
      await storage.initialise()
      const filename = 'test.txt'
      const content = 'Hello, World!'
      await storage.writeFile(filename, content)
      const containerClient = BlobServiceClient.fromConnectionString().getContainerClient()
      expect(containerClient.getBlockBlobClient).toHaveBeenCalledWith(filename)
      expect(containerClient.getBlockBlobClient().upload).toHaveBeenCalledWith(content, content.length)
    })

    test('should write data request file to blob storage and return blob client', async () => {
      await storage.initialise()
      const filename = 'datarequest.json'
      const content = JSON.stringify({ data: 'test data' })
      const blobClient = await storage.writeDataRequestFile(filename, content)
      expect(blobClient.upload).toHaveBeenCalledWith(content, content.length)
      expect(blobClient).toBeDefined()
    })
  })
})

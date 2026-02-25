describe('Storage initialization and functionality', () => {
  let consoleLogSpy
  let storage
  let uploadMock
  let getBlockBlobClientMock

  beforeAll(() => {
    jest.doMock('@azure/storage-blob', () => {
      uploadMock = jest.fn().mockResolvedValue()
      getBlockBlobClientMock = jest.fn().mockImplementation((filename) => ({
        upload: uploadMock,
        uploadStream: jest.fn().mockResolvedValue(),
        url: filename
      }))

      const getContainerClientMock = jest.fn().mockReturnValue({
        createIfNotExists: jest.fn().mockResolvedValue(),
        getBlockBlobClient: getBlockBlobClientMock,
      })

      const fromConnectionStringMock = jest.fn().mockReturnValue({
        getContainerClient: getContainerClientMock,
      })

      const BlobServiceClientMock = jest.fn().mockImplementation(() => ({
        getContainerClient: getContainerClientMock,
      }))
      BlobServiceClientMock.fromConnectionString = fromConnectionStringMock
      return { BlobServiceClient: BlobServiceClientMock }
    })

    jest.doMock('@azure/identity', () => ({
      DefaultAzureCredential: jest.fn().mockImplementation((options) => ({
        type: 'DefaultAzureCredential',
        options,
      })),
    }))
  })

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    storage = require('../../app/storage')
  })

  afterEach(() => consoleLogSpy.mockRestore())

  test('should write file to blob storage', async () => {
    await storage.initialiseContainers()
    const filename = 'test.txt'
    const content = 'Hello, World!'
    await storage.writeFile(filename, content)

    expect(getBlockBlobClientMock).toHaveBeenCalledWith(filename)
    expect(uploadMock).toHaveBeenCalledWith(content, content.length)
  })

  test('should write data request file to blob storage and return URL', async () => {
    await storage.initialiseContainers()
    const filename = 'datarequest.json'
    const content = JSON.stringify({ data: 'test data' })
    const blobUri = await storage.writeDataRequestFile(filename, content)

    expect(getBlockBlobClientMock).toHaveBeenCalledWith(filename)
    expect(uploadMock).toHaveBeenCalledWith(content, content.length)
    expect(blobUri).toBe(filename)
  })

  test('should stream data request file', async () => {
    await storage.initialiseContainers()
    const filename = 'stream.json'
    const readable = { on: jest.fn(), pipe: jest.fn() }

    await storage.streamDataRequestFile(filename, readable)
    expect(getBlockBlobClientMock).toHaveBeenCalledWith(filename)
  })
})

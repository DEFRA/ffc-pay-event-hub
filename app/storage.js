const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')

const { storageConfig } = require('./config')

let blobServiceClient, container, dataRequestContainer, containersInitialised

const BUFFER_SIZE = 4 * 1024 * 1024 // 4 MB
const MAX_CONCURRENCY = 5

const getCredential = () => new DefaultAzureCredential({ managedIdentityClientId: storageConfig.managedIdentityClientId })

const createBlobServiceClient = () => {
  if (storageConfig.useConnectionString) {
    return BlobServiceClient.fromConnectionString(storageConfig.connectionString)
  }

  return new BlobServiceClient(`https://${storageConfig.account}.blob.core.windows.net`, getCredential())
}

const initialiseContainers = async () => {
  console.log(
    storageConfig.useConnectionString
      ? 'Using connection string for Table & Storage Clients'
      : 'Using DefaultAzureCredential for Table & Storage Clients'
  )

  blobServiceClient = createBlobServiceClient()
  container = blobServiceClient.getContainerClient(storageConfig.container)
  dataRequestContainer = blobServiceClient.getContainerClient(storageConfig.dataRequestContainer)

  if (storageConfig.createEntities) {
    console.log('Making sure blob containers exist')

    await Promise.all([
      container.createIfNotExists(),
      dataRequestContainer.createIfNotExists()
    ])

    containersInitialised = true
  }
}

const writeFile = async (filename, content) => {
  const blob = container.getBlockBlobClient(filename)
  await blob.upload(content, content.length)
}

const writeDataRequestFile = async (filename, content) => {
  const blob = dataRequestContainer.getBlockBlobClient(filename)
  await blob.upload(content, content.length)
  return blob
}

const writeReportFile = async (filename, readableStream) => {
  try {
    console.debug('[STORAGE] Starting report file save:', filename)
    containersInitialised ?? await initialiseContainers()

    const client = container.getBlockBlobClient(`${filename}`)
    const options = {
      blobHTTPHeaders: {
        blobContentType: 'text/json'
      }
    }

    await client.uploadStream(readableStream, BUFFER_SIZE, MAX_CONCURRENCY, options)
    console.debug('[STORAGE] Upload completed')
  } catch (error) {
    console.error('[STORAGE] Error saving report file:', error)
    throw error
  }
}

module.exports = {
  initialiseContainers,
  writeFile,
  writeDataRequestFile,
  writeReportFile
}

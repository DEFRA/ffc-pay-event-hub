const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')

const { storageConfig } = require('./config')

let blobServiceClient, container, dataRequestContainer

const getCredential = () => new DefaultAzureCredential({ managedIdentityClientId: storageConfig.managedIdentityClientId })

const createBlobServiceClient = () => {
  if (storageConfig.useConnectionString) {
    return BlobServiceClient.fromConnectionString(storageConfig.connectionString)
  }

  return new BlobServiceClient(`https://${storageConfig.account}.blob.core.windows.net`, getCredential())
}

const initialise = async () => {
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

    console.log('Storage ready')
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

module.exports = {
  initialise,
  writeFile,
  writeDataRequestFile,
}

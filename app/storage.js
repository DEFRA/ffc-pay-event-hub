const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient, odata } = require('@azure/data-tables')
const { BlobServiceClient } = require('@azure/storage-blob')
const { v4: uuidv4 } = require('uuid')

const { storageConfig } = require('./config')
const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('./constants/event-types')
const { sendAlert } = require('./messaging/send-alert')
const alertTypes = require('./constants/alert-types')
const source = require('./constants/source')

let paymentClient, holdClient, warningClient, batchClient

let blobServiceClient, container, dataRequestContainer

const getCredential = () =>
  new DefaultAzureCredential({
    managedIdentityClientId: storageConfig.managedIdentityClientId
  })

const createTableClient = (tableName) => {
  if (storageConfig.useConnectionString) {
    return TableClient.fromConnectionString(
      storageConfig.connectionString,
      tableName,
      { allowInsecureConnection: true }
    )
  }

  return new TableClient(
    `https://${storageConfig.account}.table.core.windows.net`,
    tableName,
    getCredential()
  )
}

const createBlobServiceClient = () => {
  if (storageConfig.useConnectionString) {
    return BlobServiceClient.fromConnectionString(storageConfig.connectionString)
  }

  return new BlobServiceClient(`https://${storageConfig.account}.blob.core.windows.net`, getCredential())
}

const initialiseTables = async () => {
  console.log(
    storageConfig.useConnectionString
      ? 'Using connection string for Table Client'
      : 'Using DefaultAzureCredential for Table Client'
  )

  try {
    paymentClient = createTableClient(storageConfig.paymentTable)
    holdClient = createTableClient(storageConfig.holdTable)
    warningClient = createTableClient(storageConfig.warningTable)
    batchClient = createTableClient(storageConfig.batchTable)

    if (storageConfig.createEntities) {
      console.log('Making sure tables exist')

      await Promise.all([
        paymentClient.createTable(storageConfig.paymentTable),
        holdClient.createTable(storageConfig.holdTable),
        warningClient.createTable(storageConfig.warningTable),
        batchClient.createTable(storageConfig.batchTable)
      ])
    }
  } catch (error) {
    console.error('Error creating tables', error)

    await sendAlert({
      type: alertTypes.TABLE_CREATE_ALERT,
      source: source.SOURCE,
      id: uuidv4(),
      time: new Date().toISOString(),
      data: {
        message: `Error creating tables: ${error.message}`
      }
    })

    throw error
  }
}

const initialise = async () => {
  console.log(
    storageConfig.useConnectionString
      ? 'Using connection string for Table & Storage Clients'
      : 'Using DefaultAzureCredential for Table & Storage Clients'
  )

  await initialiseTables()

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

const getClient = (eventType) => {
  switch (eventType) {
    case PAYMENT_EVENT:
      return paymentClient
    case HOLD_EVENT:
      return holdClient
    case WARNING_EVENT:
      return warningClient
    case BATCH_EVENT:
      return batchClient
    default:
      throw new Error(`Unknown event type: ${eventType}`)
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
  initialiseTables,
  getClient,
  writeFile,
  writeDataRequestFile,
  odata
}

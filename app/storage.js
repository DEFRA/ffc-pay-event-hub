const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient } = require('@azure/data-tables')
const { storageConfig } = require('./config')
const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('./constants/event-types')

let paymentClient, holdClient, warningClient, batchClient

const initialiseTables = async () => {
  const createTableClient = (tableName) => {
    if (storageConfig.useConnectionString) {
      return TableClient.fromConnectionString(storageConfig.connectionString, tableName, { allowInsecureConnection: true })
    } else {
      return new TableClient(
        `https://${storageConfig.account}.table.core.windows.net`,
        tableName,
        new DefaultAzureCredential({ managedIdentityClientId: storageConfig.managedIdentityClientId })
      )
    }
  }

  console.log(storageConfig.useConnectionString ? 'Using connection string for Table Client' : 'Using DefaultAzureCredential for Table Client')

  paymentClient = createTableClient(storageConfig.paymentTable)
  holdClient = createTableClient(storageConfig.holdTable)
  warningClient = createTableClient(storageConfig.warningTable)
  batchClient = createTableClient(storageConfig.batchTable)

  console.log('Making sure tables exist')
  await Promise.all([
    paymentClient.createTable(storageConfig.paymentTable),
    holdClient.createTable(storageConfig.holdTable),
    warningClient.createTable(storageConfig.warningTable),
    batchClient.createTable(storageConfig.batchTable)
  ])
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

module.exports = {
  initialiseTables,
  getClient
}

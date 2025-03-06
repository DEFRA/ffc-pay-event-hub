const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient } = require('@azure/data-tables')
const { storageConfig } = require('./config')
const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('./constants/event-types')

let paymentClient
let holdClient
let warningClient
let batchClient

const initialiseTables = async () => {
  if (storageConfig.useConnectionString) {
    console.log('Using connection string for Table Client')
    paymentClient = TableClient.fromConnectionString(storageConfig.connectionString, storageConfig.paymentTable, { allowInsecureConnection: true })
    holdClient = TableClient.fromConnectionString(storageConfig.connectionString, storageConfig.holdTable, { allowInsecureConnection: true })
    warningClient = TableClient.fromConnectionString(storageConfig.connectionString, storageConfig.warningTable, { allowInsecureConnection: true })
    batchClient = TableClient.fromConnectionString(storageConfig.connectionString, storageConfig.batchTable, { allowInsecureConnection: true })
  } else {
    console.log('Using DefaultAzureCredential for Table Client')
    paymentClient = new TableClient(`https://${storageConfig.account}.table.core.windows.net`, storageConfig.paymentTable, new DefaultAzureCredential({ managedIdentityClientId: storageConfig.managedIdentityClientId }))
    holdClient = new TableClient(`https://${storageConfig.account}.table.core.windows.net`, storageConfig.holdTable, new DefaultAzureCredential({ managedIdentityClientId: storageConfig.managedIdentityClientId }))
    warningClient = new TableClient(`https://${storageConfig.account}.table.core.windows.net`, storageConfig.warningTable, new DefaultAzureCredential({ managedIdentityClientId: storageConfig.managedIdentityClientId }))
    batchClient = new TableClient(`https://${storageConfig.account}.table.core.windows.net`, storageConfig.batchTable, new DefaultAzureCredential({ managedIdentityClientId: storageConfig.managedIdentityClientId }))
  }
  console.log('Making sure tables exist')
  await paymentClient.createTable(storageConfig.paymentTable)
  await holdClient.createTable(storageConfig.holdTable)
  await warningClient.createTable(storageConfig.warningTable)
  await batchClient.createTable(storageConfig.batchTable)
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

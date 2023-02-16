const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient } = require('@azure/data-tables')
const { storageConfig } = require('./config')

let tableClient

const initialiseTable = async () => {
  if (storageConfig.useConnectionString) {
    console.log('Using connection string for Table Client')
    tableClient = TableClient.fromConnectionString(storageConfig.connectionString, storageConfig.table, { allowInsecureConnection: true })
  } else {
    console.log('Using DefaultAzureCredential for Table Client')
    tableClient = new TableClient(
      `https://${storageConfig.account}.table.core.windows.net`,
      storageConfig.table,
      new DefaultAzureCredential()
    )
  }
  console.log('Making sure table exists')
  await tableClient.createTable(storageConfig.table)
}

module.exports = { initialiseTable }

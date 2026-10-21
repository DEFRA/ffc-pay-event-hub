const { batches } = require('../../database')
const { randomUUID } = require('node:crypto')
const { BATCH } = require('../../constants/categories')
const { getTimestamp } = require('./get-timestamp')

const saveBatchEvent = async (event) => {
  const timestamp = getTimestamp(event.time)

  const batchRecord = {
    id: randomUUID(),
    partitionKey: event.data.filename,
    timestamp: new Date(timestamp).toISOString(),
    rowKey: timestamp.toString(),
    category: BATCH,
    source: event.source,
    subject: event.subject,
    time: new Date(event.time).toISOString(),
    type: event.type,
    // double-encoded so the JSONB column holds a JSON string, as existing batch rows do
    data: JSON.stringify(JSON.stringify(event.data))
  }

  await batches().insert(batchRecord)
}

module.exports = {
  saveBatchEvent
}

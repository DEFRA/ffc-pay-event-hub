const db = require('../../data')
const { v4: uuidv4 } = require('uuid')
const { BATCH } = require('../../constants/categories')
const { getTimestamp } = require('./get-timestamp')

const saveBatchEvent = async (event) => {
  const timestamp = getTimestamp(event.time)

  const batchRecord = {
    id: uuidv4(),
    partitionKey: event.data.filename,
    timestamp,
    rowKey: timestamp.toString(),
    category: BATCH,
    source: event.source,
    subject: event.subject,
    time: event.time,
    type: event.type,
    data: JSON.stringify(event.data),
  }

  await db.batches.create(batchRecord)
}

module.exports = {
  saveBatchEvent,
}

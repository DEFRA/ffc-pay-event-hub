const { db } = require('../../data')
const { BATCH } = require('../../constants/categories')
const { getTimestamp } = require('./get-timestamp')

const saveBatchEvent = async (event) => {
  const timestamp = getTimestamp(event.time)

  const batchRecord = {
    partitionKey: event.data.filename,
    rowKey: timestamp.toString(),
    category: BATCH,
    source: event.source,
    subject: event.subject,
    time: event.time,
    type: event.type,
    data: JSON.stringify(event.data)
  }

  await db.batchEvent.create(batchRecord)
}

module.exports = {
  saveBatchEvent
}

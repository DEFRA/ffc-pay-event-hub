const { BATCH } = require('../../constants/categories')
const { BATCH_EVENT } = require('../../constants/event-types')
const { getClient } = require('../../storage')
const { getTimestamp } = require('./get-timestamp')

const saveBatchEvent = async (event) => {
  const timestamp = getTimestamp(event.time)
  const batchEntity = {
    partitionKey: event.data.filename,
    rowKey: timestamp.toString(),
    category: BATCH,
    ...event,
    data: JSON.stringify(event.data)
  }

  const client = getClient(BATCH_EVENT)
  await client.createEntity(batchEntity)
}

module.exports = {
  saveBatchEvent
}

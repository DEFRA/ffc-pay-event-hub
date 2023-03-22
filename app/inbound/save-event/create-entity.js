const { getTimestamp } = require('./get-timestamp')

const createEntity = (partitionKey, rowKey, category, event) => {
  const timestamp = getTimestamp(event.time)
  return {
    partitionKey: partitionKey.toString(),
    rowKey: `${rowKey}|${timestamp}`,
    category,
    ...event,
    data: event.data ? JSON.stringify(event.data) : undefined
  }
}

module.exports = {
  createEntity
}

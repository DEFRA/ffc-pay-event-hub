const { getTimestamp } = require('./get-timestamp')

const createRow = (partitionKey, rowKey, category, event) => {
  const timestamp = getTimestamp(event.time)
  return {
    partitionKey: partitionKey.toString(),
    rowKey: `${rowKey.toString().replace(/[/\\]/g, '_')}|${timestamp}`,
    category,
    ...event,
    data: event.data ? JSON.stringify(event.data) : undefined
  }
}

module.exports = {
  createRow
}

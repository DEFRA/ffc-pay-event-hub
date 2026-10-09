const { warnings } = require('../../database')
const { randomUUID } = require('node:crypto')
const { WARNING } = require('../../constants/categories')
const { createRow } = require('./create-row')
const { getWarningType } = require('./get-warning-type')
const { getTimestamp } = require('./get-timestamp')

const saveWarningEvent = async (event) => {
  const timestamp = getTimestamp(event.time)

  const row = createRow(getWarningType(event.type), event.id, WARNING, event)

  const record = {
    id: randomUUID(),
    partitionKey: row.partitionKey,
    rowKey: row.rowKey,
    timestamp: new Date(timestamp).toISOString(),
    category: row.category,
    source: row.source,
    subject: row.subject,
    time: new Date(row.time).toISOString(),
    type: row.type,
    data: JSON.stringify(row.data)
  }

  await warnings().insert(record)
}

module.exports = {
  saveWarningEvent
}

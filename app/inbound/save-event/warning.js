const { db } = require('../../data')
const { v4: uuidv4 } = require('uuid')
const { WARNING } = require('../../constants/categories')
const { createRow } = require('./create-row')
const { getWarningType } = require('./get-warning-type')
const { getTimestamp } = require('./get-timestamp')

const saveWarningEvent = async (event) => {
  const timestamp = getTimestamp(event.time)

  const row = createRow(getWarningType(event.type), event.id, WARNING, event)

  const record = {
    id: uuidv4(),
    PartitionKey: row.partitionKey,
    RowKey: row.rowKey,
    Timestamp: timestamp,
    category: row.category,
    source: row.source,
    subject: row.subject,
    time: row.time,
    type: row.type,
    data: row.data
  }

  await db.warnings.create(record)
}

module.exports = {
  saveWarningEvent
}

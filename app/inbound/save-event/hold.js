const db = require('../../data')
const { v4: uuidv4 } = require('uuid')
const { FRN, SCHEME_ID } = require('../../constants/categories')
const { createRow } = require('./create-row')
const { getTimestamp } = require('./get-timestamp')

const saveHoldEvent = async (event) => {
  const timestamp = getTimestamp(event.time)

  const rows = [
    createRow(event.data.frn, event.data.schemeId, FRN, event),
    createRow(event.data.schemeId, event.data.frn, SCHEME_ID, event),
    createRow(event.data.holdCategoryId, event.data.frn, SCHEME_ID, event)
  ]

  const records = rows.map(row => ({
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
  }))

  await db.holds.bulkCreate(records)
}

module.exports = {
  saveHoldEvent
}

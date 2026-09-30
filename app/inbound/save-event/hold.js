const { holds } = require('../../database')
const { randomUUID } = require('node:crypto')
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

  const records = rows.map((row) => ({
    id: randomUUID(),
    partitionKey: row.partitionKey,
    rowKey: row.rowKey,
    timestamp: new Date(timestamp).toISOString(),
    category: row.category,
    source: row.source,
    time: new Date(row.time).toISOString(),
    type: row.type,
    data: JSON.stringify(row.data)
  }))

  await holds().insert(records)
}

module.exports = {
  saveHoldEvent
}

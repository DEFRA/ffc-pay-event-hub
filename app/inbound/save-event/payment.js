const { payments } = require('../../database')
const { randomUUID } = require('node:crypto')
const {
  FRN,
  CORRELATION_ID,
  SCHEME_ID,
  BATCH
} = require('../../constants/categories')
const { createRow } = require('./create-row')
const { getTimestamp } = require('./get-timestamp')

const savePaymentEvent = async (event) => {
  const timestamp = getTimestamp(event.time)

  const rows = [
    createRow(
      event.data.frn,
      `${event.data.correlationId}|${event.data.invoiceNumber}`,
      FRN,
      event
    ),
    createRow(
      event.data.correlationId,
      `${event.data.frn}|${event.data.invoiceNumber}`,
      CORRELATION_ID,
      event
    ),
    createRow(
      event.data.schemeId,
      `${event.data.frn}|${event.data.invoiceNumber}`,
      SCHEME_ID,
      event
    )
  ]

  if (event.data.batch) {
    rows.push(
      createRow(
        event.data.batch,
        `${event.data.frn}|${event.data.invoiceNumber}`,
        BATCH,
        event
      )
    )
  }

  const records = rows.map((row) => ({
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
  }))

  await payments().insert(records)
}

module.exports = {
  savePaymentEvent
}

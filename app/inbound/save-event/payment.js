const db = require('../../data')
const { v4: uuidv4 } = require('uuid')
const {
  FRN,
  CORRELATION_ID,
  SCHEME_ID,
  BATCH,
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
    ),
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
    id: uuidv4(),
    partitionKey: row.partitionKey,
    rowKey: row.rowKey,
    timestamp,
    category: row.category,
    source: row.source,
    subject: row.subject,
    time: row.time,
    type: row.type,
    data: row.data,
  }))

  await db.payments.bulkCreate(records)
}

module.exports = {
  savePaymentEvent,
}

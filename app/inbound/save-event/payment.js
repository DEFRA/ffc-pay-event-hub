const { FRN, CORRELATION_ID, SCHEME_ID, BATCH } = require('../../constants/categories')
const { PAYMENT_EVENT } = require('../../constants/event-types')
const { getClient } = require('../../storage')
const { createRow } = require('./create-row')
const { createIfNotExists } = require('./create-if-not-exists')

const savePaymentEvent = async (event) => {
  const frnBasedEntity = createRow(event.data.frn, `${event.data.correlationId}|${event.data.invoiceNumber}`, FRN, event)
  const correlationIdBasedEntity = createRow(event.data.correlationId, `${event.data.frn}|${event.data.invoiceNumber}`, CORRELATION_ID, event)
  const schemeIdBasedEntity = createRow(event.data.schemeId, `${event.data.frn}|${event.data.invoiceNumber}`, SCHEME_ID, event)

  const client = getClient(PAYMENT_EVENT)
  await createIfNotExists(client, frnBasedEntity)
  await createIfNotExists(client, correlationIdBasedEntity)
  await createIfNotExists(client, schemeIdBasedEntity)

  if (event.data.batch) {
    const batchBasedEntity = createRow(event.data.batch, `${event.data.frn}|${event.data.invoiceNumber}`, BATCH, event)
    await createIfNotExists(client, batchBasedEntity)
  }
}

module.exports = {
  savePaymentEvent
}

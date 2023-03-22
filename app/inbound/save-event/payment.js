const { FRN, CORRELATION_ID, SCHEME_ID, BATCH } = require('../../constants/categories')
const { PAYMENT_EVENT } = require('../../constants/event-types')
const { getClient } = require('../../storage')
const { createEntity } = require('./create-entity')

const savePaymentEvent = async (event) => {
  const frnBasedEntity = createEntity(event.data.frn, event.data.correlationId, FRN, event)
  const correlationIdBasedEntity = createEntity(event.data.correlationId, event.data.frn, CORRELATION_ID, event)
  const schemeIdBasedEntity = createEntity(event.data.schemeId, event.data.frn, SCHEME_ID, event)

  const client = getClient(PAYMENT_EVENT)
  await client.createEntity(frnBasedEntity)
  await client.createEntity(correlationIdBasedEntity)
  await client.createEntity(schemeIdBasedEntity)

  if (event.data.batch) {
    const batchBasedEntity = createEntity(event.data.batch, event.data.frn, BATCH, event)
    await client.createEntity(batchBasedEntity)
  }
}

module.exports = {
  savePaymentEvent
}

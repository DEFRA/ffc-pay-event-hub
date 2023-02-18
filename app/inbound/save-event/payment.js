const { PAYMENT_EVENT } = require('../../constants/event-types')
const { getClient } = require('../../storage')
const { getTimestamp } = require('./get-timestamp')

const savePaymentEvent = async (event) => {
  const timestamp = getTimestamp(event.time)
  const frnBasedEntity = {
    partitionKey: event.data.frn.toString(),
    rowKey: `${event.data.correlationId}|${timestamp}`,
    category: 'frn',
    ...event,
    data: JSON.stringify(event.data)
  }

  const correlationIdBasedEntity = {
    partitionKey: event.data.correlationId,
    rowKey: `${event.data.frn}|${timestamp}`,
    category: 'correlationId',
    ...event,
    data: JSON.stringify(event.data)
  }

  const schemeIdBasedEntity = {
    partitionKey: event.data.schemeId.toString(),
    rowKey: `${event.data.frn}|${timestamp}`,
    category: 'schemeId',
    ...event,
    data: JSON.stringify(event.data)
  }

  const client = getClient(PAYMENT_EVENT)
  await client.createEntity(frnBasedEntity)
  await client.createEntity(correlationIdBasedEntity)
  await client.createEntity(schemeIdBasedEntity)
}

module.exports = {
  savePaymentEvent
}
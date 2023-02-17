const { paymentClient } = require('../storage')

const savePaymentEvent = async (event) => {
  const frnBasedEntity = {
    partitionKey: event.frn,
    rowKey: `${event.correlationId}|${event.time}`,
    ...event
  }

  const correlationIdBasedEntity = {
    partitionKey: event.correlationId,
    rowKey: `${event.frn}|${event.time}`,
    ...event
  }

  const schemeIdBasedEntity = {
    partitionKey: event.schemeId,
    rowKey: `${event.frn}|${event.time}`,
    ...event
  }

  await paymentClient.createEntity(frnBasedEntity)
  await paymentClient.createEntity(correlationIdBasedEntity)
  await paymentClient.createEntity(schemeIdBasedEntity)
}

module.exports = {
  savePaymentEvent
}

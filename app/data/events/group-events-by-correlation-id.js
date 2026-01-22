const groupEventsByCorrelationId = (events) => {
  return [
    ...events.reduce((map, event) => {
      const key = event.correlationId

      const item = map.get(key) || {
        frn: event.data.frn,
        correlationId: key,
        schemeId: event.data.schemeId,
        paymentRequestNumber: event.data.paymentRequestNumber,
        agreementNumber: event.data.agreementNumber,
        marketingYear: event.data.marketingYear,
        events: []
      }

      item.events.push(event)
      return map.set(key, item)
    }, new Map()).values()
  ]
}

module.exports = {
  groupEventsByCorrelationId
}

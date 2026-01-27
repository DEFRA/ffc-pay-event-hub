const groupEventsByFrn = (events) => {
  return [
    ...events
      .reduce((map, event) => {
        const correlationId = event.RowKey.split('|')[0]
        const key = `${event.PartitionKey}-${correlationId}`

        const item = map.get(key) || {
          frn: event.PartitionKey,
          correlationId,
          schemeId: event.data.schemeId,
          paymentRequestNumber: event.data.paymentRequestNumber,
          agreementNumber: event.data.agreementNumber,
          marketingYear: event.data.marketingYear,
          events: [],
        }

        item.events.push(event)
        return map.set(key, item)
      }, new Map())
      .values(),
  ]
}

module.exports = {
  groupEventsByFrn,
}

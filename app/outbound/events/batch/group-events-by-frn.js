const groupEventsByFrn = (events) => {
  return [
    ...events
      .reduce((map, event) => {
        const frn = event.RowKey.split('|')[0]
        const key = `${event.PartitionKey}-${frn}`
        console.log(key)

        const item = map.get(key) || {
          batch: event.PartitionKey,
          frn,
          schemeId: event.data.schemeId,
          paymentRequestNumber: event.data.paymentRequestNumber,
          agreementNumber: event.data.agreementNumber,
          marketingYear: event.data.marketingYear,
          currency: event.data.currency,
          events: []
        }

        item.events.push(event)
        return map.set(key, item)
      }, new Map())
      .values()
  ]
}

module.exports = {
  groupEventsByFrn
}

const groupEventsByFrn = (events) => {
  return [...events.reduce((x, y) => {
    const correlationId = y.rowKey.split('|')[0]
    const key = `${y.partitionKey}-${correlationId}`

    const item = x.get(key) || {
      ...{
        frn: y.partitionKey,
        correlationId,
        schemeId: y.data.schemeId,
        paymentRequestNumber: y.data.paymentRequestNumber,
        agreementNumber: y.data.agreementNumber,
        marketingYear: y.data.marketingYear,
        events: []
      }
    }
    item.events.push(y)

    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = {
  groupEventsByFrn
}

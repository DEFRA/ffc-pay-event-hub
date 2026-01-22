const groupEventsByFrn = (events) => {
  return [...events.reduce((x, y) => {
    const frn = y.rowKey.split('|')[0]
    const key = `${y.partitionKey}-${frn}`
    const item = x.get(key) || {
      ...{
        batch: y.partitionKey,
        frn,
        schemeId: y.data.schemeId,
        paymentRequestNumber: y.data.paymentRequestNumber,
        agreementNumber: y.data.agreementNumber,
        marketingYear: y.data.marketingYear,
        currency: y.data.currency,
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

const { getEventOrder } = require('./get-event-order')

const orderGroupedEvents = (events) => {
  return events.map(group => {
    const sortedEvents = group.events.sort((a, b) => {
      return getEventOrder(a.type) - getEventOrder(b.type)
    })
    return {
      ...group,
      events: sortedEvents
    }
  }).sort((a, b) => {
    return a.schemeId - b.schemeId || a.marketingYear - b.marketingYear || a.agreementNumber - b.agreementNumber || a.paymentRequestNumber - b.paymentRequestNumber
  })
}

module.exports = {
  orderGroupedEvents
}

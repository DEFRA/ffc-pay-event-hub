const { getEventOrder } = require('../get-event-order')

const orderGroupedEvents = (events) => {
  return events.map(group => {
    const sortedEvents = group.events.sort((a, b) => {
      return getEventOrder(a.type) - getEventOrder(b.type)
    })
    sortedEvents[sortedEvents.length - 1].lastEvent = true
    return {
      ...group,
      events: sortedEvents
    }
  })
}

module.exports = {
  orderGroupedEvents
}

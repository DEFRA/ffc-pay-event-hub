const { CORRELATION_ID } = require('../../../constants/categories')
const { getEvents } = require('../get-events')
const { orderGroupedEvents } = require('./order-grouped-events')
const { groupEventsByCorrelationId } = require('../group-events-by-correlation-id')
const { sanitiseEvents } = require('../sanitise-events')
const { addPendingEvents } = require('../add-pending-events')

const getEventsByCorrelationId = async (correlationId) => {
  const events = await getEvents(correlationId, CORRELATION_ID)
  const groupedEvents = groupEventsByCorrelationId(events)
  const orderedEvents = orderGroupedEvents(groupedEvents)
  const sanitisedEvents = sanitiseEvents(orderedEvents)
  return addPendingEvents(sanitisedEvents)[0]
}

module.exports = {
  getEventsByCorrelationId
}

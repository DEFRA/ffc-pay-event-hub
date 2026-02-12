const { FRN } = require('../../../constants/categories')
const { getEvents } = require('../get-events')
const { groupEventsByFrn } = require('./group-events-by-frn')
const { orderGroupedEvents } = require('../order-grouped-events')
const { sanitiseEvents } = require('../sanitise-events')
const { addValues } = require('../add-values')

const getEventsByFrn = async (frn) => {
  const events = await getEvents(frn, FRN)
  const groupedEvents = groupEventsByFrn(events)
  const orderedEvents = orderGroupedEvents(groupedEvents)
  const sanitisedEvents = sanitiseEvents(orderedEvents)
  return addValues(sanitisedEvents)
}

module.exports = {
  getEventsByFrn
}

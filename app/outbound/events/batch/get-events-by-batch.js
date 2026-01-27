const { BATCH } = require('../../../constants/categories')
const { getEvents } = require('../get-events')
const { groupEventsByFrn } = require('./group-events-by-frn')
const { orderGroupedEvents } = require('../order-grouped-events')
const { sanitiseEvents } = require('../sanitise-events')
const { addValues } = require('../add-values')

const getEventsByBatch = async (batch) => {
  const events = await getEvents(batch, BATCH)
  const groupedEvents = groupEventsByFrn(events)
  const orderedEvents = orderGroupedEvents(groupedEvents)
  const sanitisedEvents = sanitiseEvents(orderedEvents)
  return addValues(sanitisedEvents)
}

module.exports = {
  getEventsByBatch
}

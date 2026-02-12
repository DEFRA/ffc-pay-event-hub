const eventDetails = require('../../constants/event-details')
const { PAYMENT_PROCESSED_NO_FURTHER_ACTION_STATUS } = require('../../constants/statuses')

const createPendingEvents = () => {
  return Object.entries(eventDetails)
    .map(([type, details]) => ({ type, ...details }))
}

const filterPendingEvents = (events, pendingEvents) => {
  return pendingEvents.filter(pendingEvent =>
    pendingEvent.default &&
    !events.some(group => group.events.some(evt => evt.type === pendingEvent.type))
  )
}

const addPendingEventsToGroup = (group, events) => {
  if (events[events.length - 1]?.status?.detail !== PAYMENT_PROCESSED_NO_FURTHER_ACTION_STATUS) {
    const pendingEvents = createPendingEvents()
    const filteredEvents = filterPendingEvents(events, pendingEvents)
    group.events = group.events.concat(filteredEvents.map(event => ({
      status: eventDetails[event.type]
    })))
  }
}

const addPendingEvents = (events) => {
  events.forEach(group => addPendingEventsToGroup(group, events))
  return events
}

module.exports = {
  addPendingEvents
}

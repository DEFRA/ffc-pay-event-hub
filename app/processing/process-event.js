const getEventType = require('./get-event-type')
const { saveEvent } = require('./save-event')

const processEvent = async (event) => {
  const eventType = getEventType(event.type)
  await saveEvent(event, eventType)
}

module.exports = processEvent

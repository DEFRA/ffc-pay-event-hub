const { PAYMENT_EVENT_PREFIX, HOLD_EVENT_PREFIX, WARNING_EVENT_PREFIX, BATCH_EVENT_PREFIX } = require('../constants/event-prefixes')
const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('../constants/event-types')

const getEventType = (type) => {
  if (type.startsWith(PAYMENT_EVENT_PREFIX)) {
    return PAYMENT_EVENT
  } else if (type.startsWith(HOLD_EVENT_PREFIX)) {
    return HOLD_EVENT
  } else if (type.startsWith(WARNING_EVENT_PREFIX)) {
    return WARNING_EVENT
  } else if (type.startsWith(BATCH_EVENT_PREFIX)) {
    return BATCH_EVENT
  } else {
    throw new Error(`Unknown event type: ${type}`)
  }
}

module.exports = {
  getEventType
}

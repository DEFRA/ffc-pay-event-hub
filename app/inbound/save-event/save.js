const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT } = require('../../constants/event-types')
const saveHoldEvent = require('./hold')
const savePaymentEvent = require('./payment')
const saveWarningEvent = require('./warning')

const saveEvent = async (event, eventType) => {
  switch (eventType) {
    case PAYMENT_EVENT:
      await savePaymentEvent(event)
      break
    case HOLD_EVENT:
      await saveHoldEvent(event)
      break
    case WARNING_EVENT:
      await saveWarningEvent(event)
      break
  }
}

module.exports = {
  saveEvent
}

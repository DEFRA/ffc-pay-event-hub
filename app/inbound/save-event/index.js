const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('../../constants/event-types')
const { saveHoldEvent } = require('./hold')
const { savePaymentEvent } = require('./payment')
const { saveWarningEvent } = require('./warning')
const { saveBatchEvent } = require('./batch')
const { isPaymentWarning } = require('./is-payment-warning')

const saveEvent = async (event, eventType) => {
  switch (eventType) {
    case PAYMENT_EVENT:
      if (event.data?.frn) {
        await savePaymentEvent(event)
      }
      break
    case HOLD_EVENT:
      await saveHoldEvent(event)
      break
    case WARNING_EVENT:
      await saveWarningEvent(event)
      if (isPaymentWarning(event)) {
        await savePaymentEvent(event)
      }
      break
    case BATCH_EVENT:
      await saveBatchEvent(event)
      break
    default:
      throw new Error(`Unknown event type: ${eventType}`)
  }
}

module.exports = {
  saveEvent
}

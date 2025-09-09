const util = require('util')
const { v4: uuidv4 } = require('uuid')
const { VALIDATION } = require('../constants/errors')
const { processEvent } = require('../inbound')
const { validateEvent } = require('./validate-event')
const { sendAlert } = require('./send-alert')
const alertTypes = require('../constants/alert-types')
const source = require('../constants/source')

let lastAlertTriggered = null
const oneHourInSeconds = 3600000

const processEventMessage = async (message, receiver) => {
  const event = message.body
  try {
    console.log('Event received:', util.inspect(event, false, null, true))
    validateEvent(event)
    await processEvent(event)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process event:', err)
    if (!lastAlertTriggered || lastAlertTriggered + oneHourInSeconds < Date.now()) {
      const alert = {
        type: alertTypes.EVENT_SAVE_ALERT,
        source: source.SOURCE,
        id: message.id ?? uuidv4(),
        time: new Date().toISOString(),
        data: { ...event?.data }
      }
      alert.data.message = `Error processing event: ${err.message}`
      alert.data.context = err.category
      alert.data.originalEvent = event
      await sendAlert(alert)
      lastAlertTriggered = Date.now()
    }
    if (err.category === VALIDATION) {
      await receiver.deadLetterMessage(message)
    }
  }
}

module.exports = {
  processEventMessage
}

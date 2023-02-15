const util = require('util')
const { VALIDATION } = require('../constants/errors')
const validateEvent = require('./validate-event')

const processEventMessage = async (message, receiver) => {
  try {
    const request = message.body
    console.log('Event received:', util.inspect(request, false, null, true))
    validateEvent(request)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process event:', err)
    if (err.category === VALIDATION) {
      await receiver.deadLetterMessage(message)
    }
  }
}

module.exports = processEventMessage

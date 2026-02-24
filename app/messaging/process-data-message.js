const util = require('node:util')
const { validateMessage } = require('./validate-message')

const { messageConfig } = require('../config')

const { sendMessage } = require('./send-message')
const { TYPE } = require('../constants/type')
const { VALIDATION } = require('../constants/errors')
const { processDataExportRequest } = require('../data-requests')

const processDataMessage = async (message, receiver) => {
  try {
    console.log('Data request received:', util.inspect(message.body, false, null, true))

    validateMessage(message)

    const { body, messageId } = message
    const { category, value } = body

    const blobUri = await processDataExportRequest(category, value)

    console.info(`Data Request file saved at: ${blobUri.split('/').pop()}`)

    await sendMessage({ uri: blobUri.split('/').pop() }, TYPE, messageConfig.dataQueue, { sessionId: messageId })
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process data request:', err)

    if (err.category === VALIDATION) {
      await receiver.deadLetterMessage(message)
    } else {
      await receiver.abandonMessage(message)
    }
  }
}

module.exports = {
  processDataMessage,
}

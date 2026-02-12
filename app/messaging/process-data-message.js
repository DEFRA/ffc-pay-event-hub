const util = require('node:util')
const { validateMessage } = require('./validate-message')
const {
  getCachedResponse,
  setCachedResponse,
  getCacheKey,
} = require('../cache')
const { cacheConfig, messageConfig } = require('../config')
const { getData } = require('../outbound')
const { sendMessage } = require('./send-message')
const { TYPE } = require('../constants/type')
const { VALIDATION } = require('../constants/errors')
const { writeDataRequestFile } = require('../storage')

const processDataMessage = async (message, receiver) => {
  try {
    console.log(
      'Data request received:',
      util.inspect(message.body, false, null, true)
    )

    validateMessage(message)
    const { body, messageId } = message
    const { category, value } = body

    const key = getCacheKey(category, value)
    const cachedResponse = await getCachedResponse(
      cacheConfig.cache,
      body,
      key
    )
    const response = cachedResponse ?? { data: await getData(category, value) }

    if (!cachedResponse) {
      await setCachedResponse(cacheConfig.cache, key, body, response)
    }

    const filename = `${messageId}.json`
    const blobClient = await writeDataRequestFile(
      filename,
      JSON.stringify(response)
    )
    const blobUri = blobClient.url

    await sendMessage({ uri: blobUri }, TYPE, messageConfig.dataQueue, {
      sessionId: messageId,
    })
    await receiver.completeMessage(message)
    console.log(
      'Data request completed:',
      util.inspect(response, false, null, true)
    )
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

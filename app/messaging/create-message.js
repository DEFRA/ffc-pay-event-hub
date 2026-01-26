const { ALERT } = require('../constants/message-types')
const { SOURCE } = require('../constants/source')

const createMessage = (body, type = null, options = null) => {
  return {
    body,
    type: type ?? ALERT,
    source: SOURCE,
    ...options
  }
}

module.exports = {
  createMessage
}

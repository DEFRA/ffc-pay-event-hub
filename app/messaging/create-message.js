const { SOURCE } = require('../constants/source')
const { ALERT } = require('../constants/message-types')

const createMessage = (body) => {
  return {
    body,
    type: ALERT,
    source: SOURCE
  }
}

module.exports = {
  createMessage
}

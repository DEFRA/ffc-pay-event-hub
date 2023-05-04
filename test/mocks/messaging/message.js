const { SOURCE } = require('../../../app/constants/source')
const { ALERT } = require('../../../app/constants/message-types')
const { BODY } = require('./body')

module.exports = {
  MESSAGE: {
    body: BODY,
    type: ALERT,
    source: SOURCE
  }
}

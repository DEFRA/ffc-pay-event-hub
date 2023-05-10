const { BODY } = require('./body')
const { ALERT } = require('../../../app/constants/message-types')
const { SOURCE } = require('../../../app/constants/source')

module.exports = {
  MESSAGE: {
    body: BODY,
    type: ALERT,
    source: SOURCE
  }
}

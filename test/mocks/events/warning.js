const event = require('./event')
const { MESSAGE } = require('../values/message')
const { WARNING_TYPE } = require('../values/type')

module.exports = {
  ...event,
  type: WARNING_TYPE,
  data: {
    message: MESSAGE
  }
}

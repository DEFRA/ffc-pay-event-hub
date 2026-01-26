const { PAYMENT_EXTRACTED } = require('../../../app/constants/events')
const { VALUE } = require('../values/value')

const event = require('./event')

module.exports = {
  ...event,
  type: PAYMENT_EXTRACTED,
  data: {
    ...event.data,
    value: VALUE / 100
  }
}

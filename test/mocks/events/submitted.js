const { PAYMENT_SUBMITTED } = require('../../../app/constants/events')
const event = require('./event-2')

module.exports = {
  ...event,
  type: PAYMENT_SUBMITTED
}

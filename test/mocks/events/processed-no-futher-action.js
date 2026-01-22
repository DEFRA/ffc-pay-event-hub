const { PAYMENT_PROCESSED_NO_FURTHER_ACTION } = require('../../../app/constants/events')
const event = require('./event')

module.exports = {
  ...event,
  type: PAYMENT_PROCESSED_NO_FURTHER_ACTION
}

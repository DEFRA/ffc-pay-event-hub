const event = require('./event')

module.exports = {
  ...event,
  type: 'uk.gov.defra.ffc.pay.warning.event',
  data: {
    message: 'This is a warning message'
  }
}

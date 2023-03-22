const event = require('./event')

module.exports = {
  ...event,
  type: 'uk.gov.defra.ffc.pay.payment.event',
  data: {
    frn: 1234567890,
    correlationId: '82f962a4-99d9-4f27-b3c1-4083b402d58d',
    schemeId: 1
  }
}

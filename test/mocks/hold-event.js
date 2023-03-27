const event = require('./event')

module.exports = {
  ...event,
  type: 'uk.gov.defra.ffc.pay.hold.event',
  data: {
    frn: 1234567890,
    schemeId: 1,
    holdCategoryId: 1
  }
}

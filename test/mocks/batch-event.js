const event = require('./event')

module.exports = {
  ...event,
  type: 'uk.gov.defra.ffc.pay.batch.event',
  data: {
    schemeId: 1,
    filename: 'batch-file.dat'
  }
}

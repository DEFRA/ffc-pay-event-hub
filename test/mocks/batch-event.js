const event = require('./event')

const FILENAME = 'batch-file.dat'

module.exports = {
  ...event,
  type: 'uk.gov.defra.ffc.pay.batch.event',
  subject: FILENAME,
  data: {
    filename: FILENAME
  }
}

const event = require('./event')
const { FILENAME } = require('../values/filename')
const { BATCH_TYPE } = require('../values/type')

module.exports = {
  ...event,
  type: BATCH_TYPE,
  subject: FILENAME,
  data: {
    filename: FILENAME
  }
}

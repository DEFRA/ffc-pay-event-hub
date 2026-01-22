const { FRN, CORRELATION_ID, SCHEME_ID, BATCH } = require('../constants/categories')
const { getEventsByFrn, getEventsByCorrelationId, getEventsByScheme, getEventsByBatch } = require('./events')

const getData = async (category, value) => {
  switch (category) {
    case FRN:
      return getEventsByFrn(value)
    case CORRELATION_ID:
      return getEventsByCorrelationId(value)
    case SCHEME_ID:
      return getEventsByScheme(value)
    case BATCH:
      return getEventsByBatch(value)
    default:
      throw new Error(`Unknown category: ${category}`)
  }
}

module.exports = {
  getData
}

const {
  BATCH,
  FRN,
  CORRELATION_ID,
  SCHEME_ID
} = require('../constants/categories')

const { getEventsByBatch } = require('./batch/get-events-by-batch')
const { getEventsByFrn } = require('./frn/get-events-by-frn')
const {
  getEventsByCorrelationId
} = require('./correlation-id/get-events-by-correlation-id')
const { getEventsByScheme } = require('./scheme-id/get-events-by-scheme')

const { persistExportFile } = require('./utils/persist-export-file')

const processDataExportRequest = async (category, value) => {
  switch (category) {
    case BATCH: {
      return getEventsByBatch(value)
    }

    case FRN: {
      return getEventsByFrn(value)
    }

    case CORRELATION_ID: {
      const data = await getEventsByCorrelationId(value)
      return persistExportFile('events-by-correlation-id', data)
    }

    case SCHEME_ID: {
      const data = await getEventsByScheme(value)
      return persistExportFile('events-by-scheme-id', data)
    }

    default:
      throw new Error(`Unknown category: ${category}`)
  }
}

module.exports = {
  processDataExportRequest
}

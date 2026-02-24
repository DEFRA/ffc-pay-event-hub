const { parseRow } = require('../utils/parse-row')
const {
  generateSqlQuery,
  exportQueryToJsonFile,
} = require('../file-generator')

const eventDetails = require('../../constants/event-details')
const schemeNames = require('../../constants/scheme-names')
const { convertToString } = require('../../currency')

const EXCLUDED_KEYS = new Set([
  'batchName',
  'schemeId',
  'type',
])

const copyNonExcludedKeys = (source) => {
  return Object.keys(source).reduce((acc, key) => {
    if (!EXCLUDED_KEYS.has(key)) {
      acc[key] = source[key]
    }
    return acc
  }, {})
}

const mapCoreFields = (row, target) => {
  if (row.batchName) {
    target.batch = row.batchName
  }

  if (row.schemeId) {
    target.scheme = schemeNames[row.schemeId]
  }

  if (row.type) {
    target.status = eventDetails[row.type] || 'UNKNOWN'
  }

  if (row.originalValue) {
    target.originalValueText = convertToString(row.originalValue)
  }
}

const transformRow = (row) => {
  const transformed = copyNonExcludedKeys(row)

  mapCoreFields(row, transformed)

  return transformed
}

const writeJsonRow = (stream, data, isFirstRow) => {
  if (!isFirstRow.value) {
    stream.write(',\n')
  }

  stream.write(JSON.stringify(data))
  isFirstRow.value = false
}

const reportProcessingFunc = (row, outputStream, isFirstRow) => {
  const parsed = parseRow(row)

  if (parsed && typeof parsed === 'object') {
    const transformed = transformRow(parsed)
    writeJsonRow(outputStream, transformed, isFirstRow)
  } else {
    writeJsonRow(outputStream, parsed, isFirstRow)
  }
}

const eventsByBatchStreamOptions = {
  onStart: (stream) => {
    stream.write('{ "data": [\n')
  },
  onEnd: (stream) => {
    stream.end('\n] }\n')
  },
}

const getEventsByBatchStream = async (batch) => {
  const sql = generateSqlQuery({ batchName: batch }, 'paymentBatchEvents')
  return exportQueryToJsonFile(
    sql,
    reportProcessingFunc,
    'events-by-batch',
    eventsByBatchStreamOptions
  )
}

module.exports = {
  getEventsByBatchStream,
  transformRow,
  writeJsonRow,
}

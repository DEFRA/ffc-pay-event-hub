const {
  generateSqlQuery,
  exportQueryToJsonFile,
} = require('../file-generator')

const { streamOptions } = require('../utils/stream-options.test')
const { writeJsonRow, createReportProcessor } = require('../utils/json-stream.test')
const { copyNonExcludedKeys, mapCommonFields } = require('../utils/transform.test')

const EXCLUDED_KEYS = new Set(['batchName', 'schemeId', 'type'])

const mapBatchFields = (row, target) => {
  if (row.batchName) {
    target.batch = row.batchName
  }

  mapCommonFields(row, target)
}

const transformRow = (row) => {
  const transformed = copyNonExcludedKeys(row, EXCLUDED_KEYS)
  mapBatchFields(row, transformed)
  return transformed
}

const getEventsByBatch = async (batch) => {
  const sql = generateSqlQuery({ batchName: batch }, 'paymentBatchEvents', [['frn', 'ASC']])
  return exportQueryToJsonFile(
    sql,
    createReportProcessor(transformRow),
    'events-by-batch',
    streamOptions
  )
}

module.exports = {
  getEventsByBatch,
  transformRow,
  writeJsonRow,
}

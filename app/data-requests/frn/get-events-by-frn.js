const moment = require('moment-timezone')

const {
  generateSqlQuery,
  exportQueryToJsonFile
} = require('../file-generator')

const { streamOptions } = require('../utils/stream-options')
const { writeJsonRow, createReportProcessor } = require('../utils/json-stream')
const { copyNonExcludedKeys, mapCommonFields } = require('../utils/transform')

const { TIMEZONE } = require('../../constants/timezone')
const { DATE } = require('../../constants/date-format')

const EXCLUDED_KEYS = new Set([
  'schemeId',
  'type',
  'originalValue',
  'lastUpdated'
])

const mapFrnFields = (row, target) => {
  if (row.lastUpdated) {
    target.lastUpdated = moment(row.lastUpdated).tz(TIMEZONE).format(DATE)
  }

  mapCommonFields(row, target)
}

const transformRow = (row) => {
  const transformed = copyNonExcludedKeys(row, EXCLUDED_KEYS)
  mapFrnFields(row, transformed)
  return transformed
}

const getEventsByFrn = async (frn) => {
  const sql = generateSqlQuery({ frn }, 'paymentFrnEvents', [
    ['schemeId', 'ASC'],
    ['lastUpdated', 'DESC'],
    ['paymentRequestNumber', 'ASC']
  ])
  return exportQueryToJsonFile(
    sql,
    createReportProcessor(transformRow),
    'events-by-frn',
    streamOptions
  )
}

module.exports = {
  getEventsByFrn,
  transformRow,
  writeJsonRow
}

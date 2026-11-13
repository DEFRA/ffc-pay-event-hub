const moment = require('moment-timezone')
const { payments } = require('../../database')
const {
  generateSqlQuery,
  exportQueryToJsonFile
} = require('../file-generator')
const { streamOptions } = require('../utils/stream-options')
const { writeJsonRow, createReportProcessor } = require('../utils/json-stream')
const { copyNonExcludedKeys, mapCommonFields } = require('../utils/transform')

const { TIMEZONE } = require('../../constants/timezone')
const { DATE } = require('../../constants/date-format')
const { PAYMENT_ENRICHED } = require('../../constants/events')

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

const getEventsByDate = async (params) => {
  const { schemeId, day, month, year } = params
  const start = moment.tz({
    year: Number(year),
    month: Number(month) - 1,
    day: Number(day)
  }, TIMEZONE).startOf('day')
  const end = start.clone().add(1, 'day')

  const paymentRows = await payments()
    .select('id')
    .where('partitionKey', schemeId)
    .where('timestamp', '>=', start.toDate())
    .where('timestamp', '<', end.toDate())
    .where('type', PAYMENT_ENRICHED)

  const paymentIds = paymentRows.map(({ id }) => id)

  const sql = generateSqlQuery('paymentFrnEvents', null, [
    ['schemeId', 'ASC'],
    ['agreementNumber', 'ASC'],
    ['paymentRequestNumber', 'ASC'],
    ['lastUpdated', 'DESC']
  ],
  { column: 'id', values: paymentIds })

  return exportQueryToJsonFile(
    sql,
    createReportProcessor(transformRow),
    'events-by-date',
    streamOptions
  )
}

module.exports = {
  getEventsByDate,
  transformRow,
  writeJsonRow
}

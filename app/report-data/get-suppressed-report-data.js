const {
  generateSqlQuery,
  exportQueryToJsonFile
} = require('../data-requests/file-generator')

const { reportProcessingFunc } = require('./report-row-processor')

const { FRN } = require('../constants/categories')
const { PAYMENT_SUPPRESSED } = require('../constants/events')

const generateSuppressedReportSql = async (tableName = 'payments') => {
  const whereClause = {
    category: FRN,
    type: PAYMENT_SUPPRESSED
  }

  return generateSqlQuery(whereClause, tableName)
}

const getSuppressedReportData = async (tableName = 'payments') => {
  const sql = await generateSuppressedReportSql(tableName)
  return exportQueryToJsonFile(sql, reportProcessingFunc, 'suppressed-report')
}

module.exports = {
  getSuppressedReportData
}

const { generateSqlQuery, exportQueryToJsonFile } = require('./report-file-generator.js')
const { PAYMENT_SUPPRESSED } = require('../constants/events')
const { FRN } = require('../constants/categories')

const generateSuppressedReportSql = async (tableName = 'payments') => {
  const whereClause = {
    category: FRN,
    type: PAYMENT_SUPPRESSED
  }

  return generateSqlQuery(whereClause, tableName)
}

const getSuppressedReportData = async (tableName = 'payments') => {
  const sql = await generateSuppressedReportSql(tableName)
  return exportQueryToJsonFile(sql, 'suppressed-report')
}

module.exports = {
  getSuppressedReportData
}

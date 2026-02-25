jest.mock('../../../app/data-requests/file-generator')
jest.mock('../../../app/report-data/report-row-processor')

const {
  generateSqlQuery,
  exportQueryToJsonFile
} = require('../../../app/data-requests/file-generator')

const { reportProcessingFunc } = require('../../../app/report-data/report-row-processor')

const { FRN } = require('../../../app/constants/categories')
const { PAYMENT_SUPPRESSED } = require('../../../app/constants/events')

const { getSuppressedReportData } = require('../../../app/report-data/get-suppressed-report-data')

describe('getSuppressedReportData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const setup = async (sql = 'SQL_QUERY', tableName) => {
    generateSqlQuery.mockResolvedValue(sql)
    exportQueryToJsonFile.mockResolvedValue('FILE_RESULT')

    const result = await getSuppressedReportData(tableName)

    return { result }
  }

  test.each([
    ['default table name', undefined, 'payments', 'SQL_QUERY'],
    ['custom table name', 'custom_table', 'custom_table', 'CUSTOM_SQL']
  ])(
    'generates SQL using %s',
    async (_, inputTable, expectedTable, sqlValue) => {
      generateSqlQuery.mockResolvedValue(sqlValue)

      const { result } = await setup(sqlValue, inputTable)

      expect(generateSqlQuery).toHaveBeenCalledWith(
        {
          category: FRN,
          type: PAYMENT_SUPPRESSED
        },
        expectedTable
      )

      expect(exportQueryToJsonFile).toHaveBeenCalledWith(
        sqlValue,
        reportProcessingFunc,
        'suppressed-report'
      )

      expect(result).toBe('FILE_RESULT')
    }
  )
})

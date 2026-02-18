const { generateSqlQuery, exportQueryToJsonFile } = require('../../../app/report-data/report-file-generator')
const { PAYMENT_SUPPRESSED } = require('../../../app/constants/events')
const { FRN } = require('../../../app/constants/categories')

jest.mock('../../../app/report-data/report-file-generator', () => ({
  generateSqlQuery: jest.fn(),
  exportQueryToJsonFile: jest.fn()
}))

const { getSuppressedReportData } = require('../../../app/report-data/get-suppressed-report-data')

describe('getSuppressedReportData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('generates SQL with default table name and exports suppressed report', async () => {
    generateSqlQuery.mockResolvedValue('SQL_QUERY')
    exportQueryToJsonFile.mockResolvedValue({ result: 'ok' })

    const result = await getSuppressedReportData()

    expect(generateSqlQuery).toHaveBeenCalledWith(
      {
        category: FRN,
        type: PAYMENT_SUPPRESSED
      },
      'payments'
    )

    expect(exportQueryToJsonFile).toHaveBeenCalledWith(
      'SQL_QUERY',
      'suppressed-report'
    )

    expect(result).toEqual({ result: 'ok' })
  })

  test('uses provided table name when supplied', async () => {
    generateSqlQuery.mockResolvedValue('CUSTOM_SQL')
    exportQueryToJsonFile.mockResolvedValue({ exported: true })

    const result = await getSuppressedReportData('custom_table')

    expect(generateSqlQuery).toHaveBeenCalledWith(
      {
        category: FRN,
        type: PAYMENT_SUPPRESSED
      },
      'custom_table'
    )

    expect(exportQueryToJsonFile).toHaveBeenCalledWith(
      'CUSTOM_SQL',
      'suppressed-report'
    )

    expect(result).toEqual({ exported: true })
  })
})

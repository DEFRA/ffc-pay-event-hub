jest.mock('../../../../app/data-requests/file-generator', () => ({
  generateSqlQuery: jest.fn(),
  exportQueryToJsonFile: jest.fn().mockResolvedValue('mock-file.json'),
}))

jest.mock('../../../../app/data-requests/utils/json-stream', () => ({
  writeJsonRow: jest.fn(),
  createReportProcessor: jest.fn((fn) => fn),
}))

jest.mock('../../../../app/data-requests/utils/transform', () => ({
  copyNonExcludedKeys: jest.fn((row, excludedKeys) => {
    const copy = {}
    Object.keys(row).forEach((k) => {
      if (!excludedKeys.has(k)) copy[k] = row[k]
    })
    return copy
  }),
  mapCommonFields: jest.fn((row, target) => {
    if (row.commonField) target.commonField = row.commonField
  }),
}))

jest.mock('moment-timezone', () => {
  return jest.fn((date) => ({
    tz: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnValue('FORMATTED_DATE'),
  }))
})

const {
  generateSqlQuery,
  exportQueryToJsonFile,
} = require('../../../../app/data-requests/file-generator')
const {
  copyNonExcludedKeys,
  mapCommonFields,
} = require('../../../../app/data-requests/utils/transform')
const {
  createReportProcessor,
} = require('../../../../app/data-requests/utils/json-stream')
const {
  getEventsByFrn,
  transformRow,
} = require('../../../../app/data-requests/frn/get-events-by-frn')

describe('events-by-frn module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('transformRow', () => {
    test('copies non-excluded keys and maps lastUpdated and common fields', () => {
      const row = {
        schemeId: 1,
        type: 'PAYMENT',
        originalValue: 100,
        lastUpdated: '2026-01-01T10:00:00Z',
        value: 500,
        commonField: 'common',
      }

      const result = transformRow(row)

      expect(copyNonExcludedKeys).toHaveBeenCalledWith(row, expect.any(Set))
      expect(mapCommonFields).toHaveBeenCalledWith(row, expect.any(Object))
      expect(result).toEqual({
        value: 500,
        commonField: 'common',
        lastUpdated: 'FORMATTED_DATE',
      })
    })

    test('does not set lastUpdated if missing', () => {
      const row = { value: 50 }
      const result = transformRow(row)
      expect(result).toEqual({ value: 50 })
    })
  })

  describe('getEventsByFrn', () => {
    test('calls generateSqlQuery and exportQueryToJsonFile with correct args', async () => {
      const frn = 'FRN123'
      generateSqlQuery.mockReturnValue('SQL_QUERY')

      const file = await getEventsByFrn(frn)

      expect(generateSqlQuery).toHaveBeenCalledWith(
        { frn },
        'paymentFrnEvents',
        [
          ['schemeId', 'ASC'],
          ['lastUpdated', 'DESC'],
          ['paymentRequestNumber', 'ASC'],
        ]
      )

      expect(createReportProcessor).toHaveBeenCalled()
      expect(exportQueryToJsonFile).toHaveBeenCalledWith(
        'SQL_QUERY',
        expect.any(Function),
        'events-by-frn',
        expect.any(Object)
      )

      expect(file).toBe('mock-file.json')
    })
  })
})

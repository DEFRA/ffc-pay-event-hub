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
  getEventsByBatch,
  transformRow,
} = require('../../../../app/data-requests/batch/get-events-by-batch')

describe('events-by-batch module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('transformRow', () => {
    test('copies non-excluded keys and maps batch and common fields', () => {
      const row = {
        batchName: 'BATCH1',
        frn: '123',
        type: 'PAYMENT',
        value: 100,
        commonField: 'common',
      }

      const result = transformRow(row)

      expect(copyNonExcludedKeys).toHaveBeenCalledWith(
        row,
        new Set(['batchName', 'schemeId', 'type'])
      )
      expect(mapCommonFields).toHaveBeenCalledWith(row, expect.any(Object))
      expect(result).toEqual({
        value: 100,
        commonField: 'common',
        frn: '123',
        batch: 'BATCH1',
      })
    })

    test('does not set batch if batchName is missing', () => {
      const row = { value: 50 }
      const result = transformRow(row)
      expect(result).toEqual({ value: 50 })
    })
  })

  describe('getEventsByBatch', () => {
    test('calls generateSqlQuery and exportQueryToJsonFile with correct args', async () => {
      const batch = 'BATCH1'
      generateSqlQuery.mockReturnValue('SQL_QUERY')

      const file = await getEventsByBatch(batch)

      expect(generateSqlQuery).toHaveBeenCalledWith(
        { batchName: batch },
        'paymentBatchEvents',
        [['frn', 'ASC']]
      )

      expect(createReportProcessor).toHaveBeenCalled()
      expect(exportQueryToJsonFile).toHaveBeenCalledWith(
        'SQL_QUERY',
        expect.any(Function),
        'events-by-batch',
        expect.any(Object)
      )

      expect(file).toBe('mock-file.json')
    })
  })
})

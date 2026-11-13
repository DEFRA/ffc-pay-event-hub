jest.mock('../../../../app/database', () => ({
  payments: jest.fn()
}))

jest.mock('../../../../app/data-requests/file-generator', () => ({
  generateSqlQuery: jest.fn(),
  exportQueryToJsonFile: jest.fn().mockResolvedValue('mock-file.json')
}))

jest.mock('../../../../app/data-requests/utils/json-stream', () => ({
  writeJsonRow: jest.fn(),
  createReportProcessor: jest.fn((fn) => fn)
}))

jest.mock('../../../../app/data-requests/utils/transform', () => ({
  copyNonExcludedKeys: jest.fn((row, excludedKeys) => {
    const copy = {}
    Object.keys(row).forEach((key) => {
      if (!excludedKeys.has(key)) copy[key] = row[key]
    })
    return copy
  }),
  mapCommonFields: jest.fn((row, target) => {
    if (row.commonField) target.commonField = row.commonField
  })
}))

jest.mock('moment-timezone', () => {
  const moment = jest.fn(() => ({
    tz: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnValue('FORMATTED_DATE')
  }))
  moment.tz = jest.fn()
  return moment
})

const { payments } = require('../../../../app/database')
const moment = require('moment-timezone')
const {
  generateSqlQuery,
  exportQueryToJsonFile
} = require('../../../../app/data-requests/file-generator')
const {
  copyNonExcludedKeys,
  mapCommonFields
} = require('../../../../app/data-requests/utils/transform')
const {
  createReportProcessor
} = require('../../../../app/data-requests/utils/json-stream')
const { streamOptions } = require('../../../../app/data-requests/utils/stream-options')
const { TIMEZONE } = require('../../../../app/constants/timezone')
const { PAYMENT_ENRICHED } = require('../../../../app/constants/events')
const {
  getEventsByDate,
  transformRow,
  writeJsonRow
} = require('../../../../app/data-requests/date/get-events-by-date')

describe('events-by-date module', () => {
  let query
  let start
  let end
  let mockStartDate
  let mockEndDate
  let paymentRows

  beforeEach(() => {
    jest.clearAllMocks()

    paymentRows = [{ id: 'payment-id-1' }, { id: 'payment-id-2' }]
    query = {
      select: jest.fn(),
      where: jest.fn(),
      then: jest.fn((resolve) => resolve(paymentRows))
    }
    query.select.mockReturnValue(query)
    query.where.mockReturnValue(query)
    payments.mockReturnValue(query)

    mockStartDate = new Date('2024-01-11T00:00:00.000Z')
    mockEndDate = new Date('2024-01-12T00:00:00.000Z')

    end = {
      add: jest.fn().mockReturnThis(),
      toDate: jest.fn().mockReturnValue(mockEndDate)
    }

    start = {
      startOf: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnValue(end),
      toDate: jest.fn().mockReturnValue(mockStartDate)
    }

    moment.tz.mockReturnValue(start)
  })

  describe('transformRow', () => {
    test('copies non-excluded keys and maps lastUpdated and common fields', () => {
      const row = {
        schemeId: 1,
        type: 'PAYMENT',
        originalValue: 100,
        lastUpdated: '2026-01-01T10:00:00Z',
        value: 500,
        commonField: 'common'
      }

      expect(transformRow(row)).toEqual({
        value: 500,
        commonField: 'common',
        lastUpdated: expect.any(String)
      })

      expect(copyNonExcludedKeys).toHaveBeenCalledWith(row, expect.any(Set))
      expect(mapCommonFields).toHaveBeenCalledWith(row, expect.any(Object))
    })

    test('does not set lastUpdated if missing', () => {
      expect(transformRow({ value: 50 })).toEqual({ value: 50 })
    })

    test('exports writeJsonRow', () => {
      expect(writeJsonRow).toBeDefined()
    })
  })

  describe('getEventsByDate', () => {
    test('queries payment IDs for the date and exports matching events', async () => {
      generateSqlQuery.mockReturnValue('SQL_QUERY')

      const file = await getEventsByDate({
        schemeId: 3,
        day: 11,
        month: 1,
        year: 2024
      })

      expect(moment.tz).toHaveBeenCalledWith(
        { year: 2024, month: 0, day: 11 },
        TIMEZONE
      )
      expect(start.startOf).toHaveBeenCalledWith('day')
      expect(start.clone).toHaveBeenCalled()
      expect(end.add).toHaveBeenCalledWith(1, 'day')

      expect(payments).toHaveBeenCalled()
      expect(query.select).toHaveBeenCalledWith('id')
      expect(query.where).toHaveBeenNthCalledWith(1, 'partitionKey', 3)
      expect(query.where).toHaveBeenNthCalledWith(
        2,
        'timestamp',
        '>=',
        mockStartDate
      )
      expect(query.where).toHaveBeenNthCalledWith(
        3,
        'timestamp',
        '<',
        mockEndDate
      )
      expect(query.where).toHaveBeenNthCalledWith(
        4,
        'type',
        PAYMENT_ENRICHED
      )

      expect(generateSqlQuery).toHaveBeenCalledWith(
        'paymentFrnEvents',
        null,
        [
          ['schemeId', 'ASC'],
          ['agreementNumber', 'ASC'],
          ['paymentRequestNumber', 'ASC'],
          ['lastUpdated', 'DESC']
        ],
        { column: 'id', values: ['payment-id-1', 'payment-id-2'] }
      )

      expect(createReportProcessor).toHaveBeenCalledWith(expect.any(Function))
      expect(exportQueryToJsonFile).toHaveBeenCalledWith(
        'SQL_QUERY',
        expect.any(Function),
        'events-by-date',
        streamOptions
      )
      expect(file).toBe('mock-file.json')
    })
  })
})

jest.mock('../../../app/outbound/events')
const {
  getEventsByFrn: mockGetEventsByFrn,
  getEventsByCorrelationId: mockGetEventsByCorrelationId,
  getEventsByBatch: mockGetEventsByBatch,
  getEventsByScheme: mockGetEventsByScheme,
} = require('../../../app/outbound/events')

const { FRN: FRN_VALUE } = require('../../mocks/values/frn')
const {
  CORRELATION_ID: CORRELATION_ID_VALUE,
} = require('../../mocks/values/correlation-id')
const { BATCH: BATCH_VALUE } = require('../../mocks/values/batch')
const { SCHEME_ID } = require('../../mocks/values/scheme-id')

const {
  FRN: FRN_CATEGORY,
  CORRELATION_ID: CORRELATION_ID_CATEGORY,
  BATCH: BATCH_CATEGORY,
  SCHEME_ID: SCHEME_ID_CATEGORY,
} = require('../../../app/constants/categories')

const { getData } = require('../../../app/outbound/')

describe('get data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each([
    [FRN_CATEGORY, FRN_VALUE, mockGetEventsByFrn],
    [
      CORRELATION_ID_CATEGORY,
      CORRELATION_ID_VALUE,
      mockGetEventsByCorrelationId,
    ],
    [BATCH_CATEGORY, BATCH_VALUE, mockGetEventsByBatch],
    [SCHEME_ID_CATEGORY, SCHEME_ID, mockGetEventsByScheme],
  ])('should get events for category %s', async (category, value, mockFn) => {
    await getData(category, value)
    expect(mockFn).toHaveBeenCalledWith(value)
  })

  test('should throw an error for unknown category', async () => {
    await expect(getData('unknown', 'value')).rejects.toThrow(
      'Unknown category: unknown'
    )
  })
})

const db = require('../../../../../app/data')
const {
  getEventsByScheme,
} = require('../../../../../app/data-requests/scheme-id/get-events-by-scheme')
const {
  sanitiseSchemeData,
} = require('../../../../../app/data-requests/scheme-id/sanitise-scheme-data')

jest.mock(
  '../../../../../app/outbound/events/scheme-id/sanitise-scheme-data',
  () => ({
    sanitiseSchemeData: jest.fn((data) => data),
  })
)

describe('getEventsByScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return sanitized data for all schemes when no schemeId is provided', async () => {
    db.schemePaymentTotals.findAll = jest.fn().mockResolvedValue([
      {
        schemeId: 'SFI1',
        paymentRequests: '100',
        value: '£1,000.00',
      },
      {
        schemeId: 'SFI2',
        paymentRequests: '200',
        value: '£2,000.00',
      },
    ])

    const result = await getEventsByScheme()

    expect(db.schemePaymentTotals.findAll).toHaveBeenCalledWith({ where: {} })
    expect(sanitiseSchemeData).toHaveBeenCalledTimes(1)
    expect(result).toEqual([
      { schemeId: 'SFI1', paymentRequests: 100, value: '£1,000.00' },
      { schemeId: 'SFI2', paymentRequests: 200, value: '£2,000.00' },
    ])
  })

  test('should filter by schemeId when provided', async () => {
    const schemeId = 'SFI1'

    db.schemePaymentTotals.findAll = jest.fn().mockResolvedValue([
      {
        schemeId: 'SFI1',
        paymentRequests: '100',
        value: '£1,000.00',
      },
    ])

    const result = await getEventsByScheme(schemeId)

    expect(db.schemePaymentTotals.findAll).toHaveBeenCalledWith({
      where: { schemeId },
    })
    expect(result).toEqual([
      { schemeId: 'SFI1', paymentRequests: 100, value: '£1,000.00' },
    ])
  })

  test('should convert paymentRequests to a number', async () => {
    db.schemePaymentTotals.findAll = jest.fn().mockResolvedValue([
      {
        schemeId: 'SFI3',
        paymentRequests: '42',
        value: '£500.00',
      },
    ])

    const result = await getEventsByScheme('SFI3')

    expect(result[0].paymentRequests).toBe(42)
    expect(typeof result[0].paymentRequests).toBe('number')
  })

  test('should return an empty array when no data is found', async () => {
    db.schemePaymentTotals.findAll = jest.fn().mockResolvedValue([])

    const result = await getEventsByScheme('NON_EXISTENT')

    expect(result).toEqual([])
  })
})

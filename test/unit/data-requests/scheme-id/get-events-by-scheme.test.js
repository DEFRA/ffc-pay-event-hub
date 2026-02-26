jest.mock('../../../../app/data', () => ({
  schemePaymentTotals: {
    findAll: jest.fn(),
  },
}))

jest.mock(
  '../../../../app/data-requests/scheme-id/sanitise-scheme-data',
  () => ({
    sanitiseSchemeData: jest.fn((data) => data),
  })
)

const db = require('../../../../app/data')
const {
  sanitiseSchemeData,
} = require('../../../../app/data-requests/scheme-id//sanitise-scheme-data')
const {
  getEventsByScheme,
} = require('../../../../app/data-requests/scheme-id/get-events-by-scheme')

describe('getEventsByScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('fetches all scheme events when no schemeId is provided', async () => {
    const rawData = [
      { schemeId: 1, paymentRequests: '5', value: 100 },
      { schemeId: 2, paymentRequests: '10', value: 250 },
    ]
    db.schemePaymentTotals.findAll.mockResolvedValue(rawData)

    const result = await getEventsByScheme()

    expect(db.schemePaymentTotals.findAll).toHaveBeenCalledWith({ where: {} })
    expect(sanitiseSchemeData).toHaveBeenCalledWith([
      { schemeId: 1, paymentRequests: 5, value: 100 },
      { schemeId: 2, paymentRequests: 10, value: 250 },
    ])
    expect(result).toEqual([
      { schemeId: 1, paymentRequests: 5, value: 100 },
      { schemeId: 2, paymentRequests: 10, value: 250 },
    ])
  })

  test('fetches scheme events for a specific schemeId', async () => {
    const rawData = [{ schemeId: 42, paymentRequests: '3', value: 75 }]
    db.schemePaymentTotals.findAll.mockResolvedValue(rawData)

    const result = await getEventsByScheme(42)

    expect(db.schemePaymentTotals.findAll).toHaveBeenCalledWith({
      where: { schemeId: 42 },
    })
    expect(sanitiseSchemeData).toHaveBeenCalledWith([
      { schemeId: 42, paymentRequests: 3, value: 75 },
    ])
    expect(result).toEqual([{ schemeId: 42, paymentRequests: 3, value: 75 }])
  })

  test('handles empty results', async () => {
    db.schemePaymentTotals.findAll.mockResolvedValue([])

    const result = await getEventsByScheme(99)

    expect(db.schemePaymentTotals.findAll).toHaveBeenCalledWith({
      where: { schemeId: 99 },
    })
    expect(sanitiseSchemeData).toHaveBeenCalledWith([])
    expect(result).toEqual([])
  })
})

const { createKnexMock } = require('../../../helpers/mock-knex')

const mockDb = createKnexMock(['schemePaymentTotals'])

jest.mock('../../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

jest.mock(
  '../../../../app/data-requests/scheme-id/sanitise-scheme-data',
  () => ({
    sanitiseSchemeData: jest.fn((data) => data)
  })
)

const {
  sanitiseSchemeData
} = require('../../../../app/data-requests/scheme-id//sanitise-scheme-data')
const {
  getEventsByScheme
} = require('../../../../app/data-requests/scheme-id/get-events-by-scheme')

describe('getEventsByScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('fetches all scheme events when no schemeId is provided', async () => {
    const rawData = [
      { schemeId: 1, paymentRequests: '5', value: 100 },
      { schemeId: 2, paymentRequests: '10', value: 250 }
    ]
    mockDb.builder.resolves(rawData)

    const result = await getEventsByScheme()

    expect(mockDb.tables.schemePaymentTotals).toHaveBeenCalledWith()
    expect(mockDb.builder.select).toHaveBeenCalledWith('schemeId', 'paymentRequests', 'value')
    expect(mockDb.builder.where).toHaveBeenCalledWith({})
    expect(sanitiseSchemeData).toHaveBeenCalledWith([
      { schemeId: 1, paymentRequests: 5, value: 100 },
      { schemeId: 2, paymentRequests: 10, value: 250 }
    ])
    expect(result).toEqual([
      { schemeId: 1, paymentRequests: 5, value: 100 },
      { schemeId: 2, paymentRequests: 10, value: 250 }
    ])
  })

  test('fetches scheme events for a specific schemeId', async () => {
    const rawData = [{ schemeId: 42, paymentRequests: '3', value: 75 }]
    mockDb.builder.resolves(rawData)

    const result = await getEventsByScheme(42)

    expect(mockDb.builder.select).toHaveBeenCalledWith('schemeId', 'paymentRequests', 'value')
    expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: 42 })
    expect(sanitiseSchemeData).toHaveBeenCalledWith([
      { schemeId: 42, paymentRequests: 3, value: 75 }
    ])
    expect(result).toEqual([{ schemeId: 42, paymentRequests: 3, value: 75 }])
  })

  test('handles empty results', async () => {
    mockDb.builder.resolves([])

    const result = await getEventsByScheme(99)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ schemeId: 99 })
    expect(sanitiseSchemeData).toHaveBeenCalledWith([])
    expect(result).toEqual([])
  })

  test('propagates a database failure', async () => {
    mockDb.builder.rejects(new Error('DB error'))

    await expect(getEventsByScheme(1)).rejects.toThrow('DB error')
    expect(sanitiseSchemeData).not.toHaveBeenCalled()
  })
})

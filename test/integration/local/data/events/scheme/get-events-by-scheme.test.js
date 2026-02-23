const db = require('../../../../../../app/data')
const { getEventsByScheme } = require('../../../../../../app/outbound/events/scheme-id/get-events-by-scheme')
const { sanitiseSchemeData } = require('../../../../../../app/outbound/events/scheme-id/sanitise-scheme-data')
const schemeNames = require('../../../../../../app/constants/scheme-names')

const SCHEMES = Object.keys(schemeNames)
let rawViewData = []

beforeAll(async () => {
  await db.sequelize.sync(({ force: true }))
})

beforeEach(async () => {
  await db.schemePaymentTotals.destroy({ where: {} })

  rawViewData = SCHEMES.map((scheme, index) => ({
    schemeId: scheme,
    paymentRequests: 2 + index,
    value: `£${(1000 * (index + 1)).toLocaleString()}.00`
  }))

  for (const row of rawViewData) {
    await db.schemePaymentTotals.create(row)
  }
})

afterAll(async () => {
  await db.sequelize.close()
})

describe('getEventsByScheme (view-based)', () => {
  test('should return all schemes with correct data', async () => {
    const result = await getEventsByScheme()
    expect(result).toHaveLength(SCHEMES.length)

    result.forEach((schemeData) => {
      expect(schemeData.scheme).toBeDefined()
      expect(schemeData.paymentRequests).toBeGreaterThan(0)
      expect(schemeData.value).toMatch(/^£[\d,]+\.\d{2}$/)
    })
  })

  test('should return correct data for a single scheme', async () => {
    const testScheme = SCHEMES[0]
    const result = await getEventsByScheme(testScheme)
    expect(result).toHaveLength(1)

    const schemeData = result[0]
    expect(schemeData.scheme).toBe(schemeNames[testScheme])
    expect(schemeData.paymentRequests).toBe(rawViewData[0].paymentRequests)
    expect(schemeData.value).toBe(rawViewData[0].value)
  })

  test('should match sanitised output', async () => {
    const result = await getEventsByScheme()
    const expected = sanitiseSchemeData(rawViewData)
    expect(result).toEqual(expected)
  })
})

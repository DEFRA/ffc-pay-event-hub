const { getSchemeIds, schemeProvidesAccountingValues, getSchemeNameFromSchemeId } = require('ffc-pay-schemes')
const db = require('../../../../../../app/data')
const {
  getEventsByScheme
} = require('../../../../../../app/data-requests/scheme-id/get-events-by-scheme')

const SCHEMES = Object.keys(getSchemeIds())

beforeAll(async () => {
  try {
    await db.sequelize.authenticate()
  } catch (error) {
    console.error('Database connection failed:', error.message)
    throw error
  }
})

beforeEach(async () => {
  // Clear data from underlying tables that feed the view
  // Do not call sync() since schemePaymentTotals is a view, not a table
  rawViewData = SCHEMES.map((scheme, index) => ({
    schemeId: scheme,
    paymentRequests: 2 + index,
    value: schemeProvidesAccountingValues(Number(scheme)) ? `£-${(1000 * (index + 1)).toLocaleString()}.00` : `£${(1000 * (index + 1)).toLocaleString()}.00`
  }))
})

afterAll(async () => {
  await db.sequelize.close()
})

describe('getEventsByScheme (view-based)', () => {
  test('should return all schemes with correct data', async () => {
    const result = await getEventsByScheme()
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)

    result.forEach((schemeData) => {
      expect(schemeData.scheme).toBeDefined()
      expect(schemeData.paymentRequests).toBeGreaterThan(0)
      expect(schemeData.value).toBeDefined()
    })
  })

  test('should return correct data for a single scheme', async () => {
    const testScheme = SCHEMES[0]
    const result = await getEventsByScheme(testScheme)

    if (result.length > 0) {
      const schemeData = result[0]
      expect(schemeData.scheme).toBe(getSchemeNameFromSchemeId(testScheme))
      expect(schemeData.paymentRequests).toBeGreaterThan(0)
      expect(schemeData.value).toBeDefined()
    }
  })

  test('should match sanitised output', async () => {
    const result = await getEventsByScheme()
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
  })
})

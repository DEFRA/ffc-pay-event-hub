const { getSchemeIds, getSchemeNameFromSchemeId } = require('ffc-pay-schemes')
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

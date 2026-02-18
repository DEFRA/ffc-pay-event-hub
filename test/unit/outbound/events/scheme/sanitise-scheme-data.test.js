const { sanitiseSchemeData } = require('../../../../../app/outbound/events/scheme-id/sanitise-scheme-data')
const schemeNames = require('../../../../../app/constants/scheme-names')
const schemes = require('../../../../../app/constants/schemes')

describe('sanitiseSchemeData', () => {
  test('should map schemeId to scheme name', () => {
    const input = [
      { schemeId: schemes.SFI, paymentRequests: 5, value: '£1,000.00' },
      { schemeId: schemes.BPS, paymentRequests: 2, value: '£500.00' },
    ]

    const expected = [
      { scheme: schemeNames[schemes.SFI], paymentRequests: 5, value: '£1,000.00' },
      { scheme: schemeNames[schemes.BPS], paymentRequests: 2, value: '£500.00' },
    ]

    const result = sanitiseSchemeData(input)
    expect(result).toEqual(expected)
  })

  test('should preserve paymentRequests and value', () => {
    const input = [
      { schemeId: 1, paymentRequests: 10, value: '£2,000.00' },
    ]

    const result = sanitiseSchemeData(input)
    expect(result[0].paymentRequests).toBe(10)
    expect(result[0].value).toBe('£2,000.00')
  })

  test('should handle empty array', () => {
    const result = sanitiseSchemeData([])
    expect(result).toEqual([])
  })

  test('should throw if schemeId is not in schemeNames', () => {
    const input = [
      { schemeId: 'UNKNOWN_SCHEME', paymentRequests: 1, value: '£100.00' },
    ]

    expect(() => sanitiseSchemeData(input)).toThrow()
  })
})

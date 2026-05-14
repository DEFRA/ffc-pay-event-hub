jest.mock('../../../../app/constants/scheme-names', () => ({
  1: 'Scheme One',
  2: 'Scheme Two'
}))

jest.mock('../../../../app/constants/accounting-value-schemes', () => [1])

const {
  sanitiseSchemeData
} = require('../../../../app/data-requests/scheme-id/sanitise-scheme-data')

describe('sanitiseSchemeData', () => {
  test('maps schemeId to scheme name and preserves fields', () => {
    const input = [
      { schemeId: 1, paymentRequests: 5, value: 100 },
      { schemeId: 2, paymentRequests: 10, value: 250 }
    ]

    const result = sanitiseSchemeData(input)

    expect(result).toEqual([
      { scheme: 'Scheme One', paymentRequests: 5, value: 100 },
      { scheme: 'Scheme Two', paymentRequests: 10, value: 250 }
    ])
  })

  test('throws an error for unknown schemeId', () => {
    const input = [{ schemeId: 99, paymentRequests: 3, value: 50 }]

    expect(() => sanitiseSchemeData(input)).toThrow('Unknown schemeId: 99')
  })

  test('works with a single scheme', () => {
    const input = [{ schemeId: 1, paymentRequests: 1, value: 10 }]

    const result = sanitiseSchemeData(input)

    expect(result).toEqual([
      { scheme: 'Scheme One', paymentRequests: 1, value: 10 }
    ])
  })

  test('flips value for accounting value schemes', () => {
    const input = [{ schemeId: 1, paymentRequests: 5, value: '£100.00' }]

    const result = sanitiseSchemeData(input)

    expect(result[0].value).toBe('£-100.00')
  })

  test('does not flip value for non-accounting value schemes', () => {
    const input = [{ schemeId: 2, paymentRequests: 5, value: '£100.00' }]

    const result = sanitiseSchemeData(input)

    expect(result[0].value).toBe('£100.00')
  })

  test('returns £0.00 for zero amount in accounting value schemes (no -0.00)', () => {
    const input = [{ schemeId: 1, paymentRequests: 5, value: '£0.00' }]

    const result = sanitiseSchemeData(input)

    expect(result[0].value).toBe('£0.00')
  })

  test('handles currency formatting with commas and pounds in accounting value schemes', () => {
    const input = [{ schemeId: 1, paymentRequests: 5, value: '£1,234.56' }]

    const result = sanitiseSchemeData(input)

    expect(result[0].value).toBe('£-1,234.56')
  })
})

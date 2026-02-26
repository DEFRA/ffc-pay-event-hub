jest.mock('../../../../app/constants/scheme-names', () => ({
  1: 'Scheme One',
  2: 'Scheme Two'
}))

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
})

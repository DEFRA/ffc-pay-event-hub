const { convertToString } = require('../../../app/currency/convert-to-string')

describe('convertToString', () => {
  test.each([
    [100, '£1.00'],
    [110, '£1.10'],
    [-100, '£-1.00'],
    [100.10, '£1.00'],
    [110.10, '£1.10'],
    [100000, '£1,000.00'],
    [1000000, '£10,000.00'],
    [10000000, '£100,000.00'],
    [100000000, '£1,000,000.00']
  ])('converts %p to "%s"', (input, expected) => {
    expect(convertToString(input)).toEqual(expected)
  })
})

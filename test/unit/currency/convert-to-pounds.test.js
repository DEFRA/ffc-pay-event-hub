const { convertToPounds } = require('../../../app/currency/convert-to-pounds')

describe('convertToPounds', () => {
  test.each([
    [100, '1.00'],
    [110, '1.10'],
    [-100, '-1.00'],
    [100.00, '1.00'],
    [100.10, '1.00'],
    [-100.10, '-1.00']
  ])('converts %p to "%s" pounds', (input, expected) => {
    expect(convertToPounds(input)).toEqual(expected)
  })
})

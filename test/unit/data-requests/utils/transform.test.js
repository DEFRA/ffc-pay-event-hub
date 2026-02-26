const {
  copyNonExcludedKeys,
  mapCommonFields,
} = require('../../../../app/data-requests/utils/transform')
const eventDetails = require('../../../../app/constants/event-details')
const schemeNames = require('../../../../app/constants/scheme-names')
const { convertToString } = require('../../../../app/currency')

jest.mock('../../../../app/currency', () => ({
  convertToString: jest.fn((value) => `£${value}`),
}))

describe('transform utilities', () => {
  describe('copyNonExcludedKeys', () => {
    test('copies keys not in excludedKeys', () => {
      const source = { a: 1, b: 2, c: 3 }
      const excluded = new Set(['b'])
      const result = copyNonExcludedKeys(source, excluded)
      expect(result).toEqual({ a: 1, c: 3 })
    })

    test('returns empty object if all keys are excluded', () => {
      const source = { a: 1 }
      const excluded = new Set(['a'])
      const result = copyNonExcludedKeys(source, excluded)
      expect(result).toEqual({})
    })
  })

  describe('mapCommonFields', () => {
    test('maps schemeId to scheme name', () => {
      const row = { schemeId: 'SCHEME1' }
      const target = {}
      schemeNames['SCHEME1'] = 'Scheme One'
      mapCommonFields(row, target)
      expect(target.scheme).toBe('Scheme One')
    })

    test('maps type to status from eventDetails', () => {
      const row = { type: 'TYPE1' }
      const target = {}
      eventDetails['TYPE1'] = 'Completed'
      mapCommonFields(row, target)
      expect(target.status).toBe('Completed')
    })

    test('maps unknown type to UNKNOWN', () => {
      const row = { type: 'UNKNOWN_TYPE' }
      const target = {}
      mapCommonFields(row, target)
      expect(target.status).toBe('UNKNOWN')
    })

    test('maps originalValue to originalValueText using convertToString', () => {
      const row = { originalValue: 123.45 }
      const target = {}
      mapCommonFields(row, target)
      expect(convertToString).toHaveBeenCalledWith(123.45)
      expect(target.originalValueText).toBe('£123.45')
    })

    test('maps multiple fields together', () => {
      schemeNames['SCHEME2'] = 'Scheme Two'
      eventDetails['TYPE2'] = 'Pending'
      const row = { schemeId: 'SCHEME2', type: 'TYPE2', originalValue: 99.99 }
      const target = {}
      mapCommonFields(row, target)
      expect(target).toEqual({
        scheme: 'Scheme Two',
        status: 'Pending',
        originalValueText: '£99.99',
      })
    })
  })
})

jest.mock('ffc-pay-schemes')
jest.mock('../../../../app/currency')
jest.mock('../../../../app/constants/event-details')

const {
  copyNonExcludedKeys,
  mapCommonFields
} = require('../../../../app/data-requests/utils/transform')
const { getSchemeNameFromSchemeId } = require('ffc-pay-schemes')
const { convertToString } = require('../../../../app/currency')
const eventDetails = require('../../../../app/constants/event-details')

describe('transform utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getSchemeNameFromSchemeId.mockImplementation((schemeId) => {
      const schemes = { SCHEME1: 'Scheme One', SCHEME2: 'Scheme Two' }
      return schemes[schemeId]
    })
    convertToString.mockImplementation((value) => `£${value}`)
    eventDetails['PAYMENT_ENRICHED'] = { name: 'Enriched', state: 'IN_PROGRESS' }
  })

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
      mapCommonFields(row, target)
      expect(target.scheme).toBe('Scheme One')
    })

    test('maps type to status from eventDetails', () => {
      const row = { type: 'PAYMENT_ENRICHED' }
      const target = {}
      mapCommonFields(row, target)
      expect(target.status).toBe(eventDetails['PAYMENT_ENRICHED'])
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
      const row = { schemeId: 'SCHEME2', type: 'PAYMENT_ENRICHED', originalValue: 99.99 }
      const target = {}
      mapCommonFields(row, target)
      expect(target).toEqual({
        scheme: 'Scheme Two',
        status: eventDetails['PAYMENT_ENRICHED'],
        originalValueText: '£99.99'
      })
    })

    test('negates originalValue when providesAccountingValues is true', () => {
      const row = { originalValue: -200, providesAccountingValues: true }
      const target = {}

      mapCommonFields(row, target)

      expect(target.originalValueText).toBe('£200')
      expect(convertToString).toHaveBeenCalledWith(200)
    })

    test('does not negate originalValue when providesAccountingValues is false', () => {
      const row = { originalValue: 150, providesAccountingValues: false }
      const target = {}

      mapCommonFields(row, target)

      expect(target.originalValueText).toBe('£150')
      expect(convertToString).toHaveBeenCalledWith(150)
    })
  })
})

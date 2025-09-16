const schema = require('../../../../app/inbound/schemas/payment')

let event = JSON.parse(JSON.stringify(require('../../../mocks/events/payment').data))

describe('payment schema', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(require('../../../mocks/events/payment').data))
  })

  test('should validate a valid payment event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should not validate a payment event with all customer identifiers missing', () => {
    delete event.frn
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should validate a payment event with only sbi', () => {
    delete event.frn
    event.sbi = 123
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should validate a payment event with only trader', () => {
    delete event.frn
    event.trader = 'someTrader'
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should validate a payment event with only vendor', () => {
    delete event.frn
    event.vendor = 'someVendor'
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should not validate a payment event with a non-number sbi', () => {
    event.sbi = 'abc'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-integer sbi', () => {
    event.sbi = 1.1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a negative sbi', () => {
    event.sbi = -1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-string trader', () => {
    event.trader = 1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-string vendor', () => {
    event.vendor = 1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with an undefined correlationId', () => {
    delete event.correlationId
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a null correlationId', () => {
    event.correlationId = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-string correlationId', () => {
    event.correlationId = 1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-uuid correlationId', () => {
    event.correlationId = 'abc'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with an undefined schemeId', () => {
    delete event.schemeId
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a null schemeId', () => {
    event.schemeId = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-number schemeId', () => {
    event.schemeId = 'abc'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-integer schemeId', () => {
    event.schemeId = 1.1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a negative schemeId', () => {
    event.schemeId = -1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with an undefined invoiceNumber', () => {
    delete event.invoiceNumber
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a null invoiceNumber', () => {
    event.invoiceNumber = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-string invoiceNumber', () => {
    event.invoiceNumber = 1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with an empty invoiceNumber', () => {
    event.invoiceNumber = ''
    expect(schema.validate(event).error).toBeDefined()
  })
})

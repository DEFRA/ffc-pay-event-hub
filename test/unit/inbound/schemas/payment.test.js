const schema = require('../../../../app/inbound/schemas/payment')

let event

describe('payment schema', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(require('../../../mocks/payment-event').data))
  })

  test('should validate a valid payment event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should not validate a payment event with an undefined frn', () => {
    delete event.frn
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a null frn', () => {
    event.frn = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-number frn', () => {
    event.frn = 'abc'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a non-integer frn', () => {
    event.frn = 1.1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a payment event with a negative frn', () => {
    event.frn = -1
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

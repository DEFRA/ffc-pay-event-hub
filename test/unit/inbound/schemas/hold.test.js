const schema = require('../../../../app/inbound/schemas/hold')

let event

describe('hold schema', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(require('../../../mocks/events/hold').data))
  })

  test('should validate a valid hold event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should not validate a hold event with an undefined frn', () => {
    delete event.frn
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a null frn', () => {
    event.frn = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a non-number frn', () => {
    event.frn = 'abc'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a non-integer frn', () => {
    event.frn = 1.1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a negative frn', () => {
    event.frn = -1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with an undefined schemeId', () => {
    delete event.schemeId
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a null schemeId', () => {
    event.schemeId = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a non-number schemeId', () => {
    event.schemeId = 'abc'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a non-integer schemeId', () => {
    event.schemeId = 1.1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a negative schemeId', () => {
    event.schemeId = -1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with an undefined holdCategoryId', () => {
    delete event.holdCategoryId
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a null holdCategoryId', () => {
    event.holdCategoryId = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a non-number holdCategoryId', () => {
    event.holdCategoryId = 'abc'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a non-integer holdCategoryId', () => {
    event.holdCategoryId = 1.1
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a hold event with a negative holdCategoryId', () => {
    event.holdCategoryId = -1
    expect(schema.validate(event).error).toBeDefined()
  })
})

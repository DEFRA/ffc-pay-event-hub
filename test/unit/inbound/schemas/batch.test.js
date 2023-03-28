const schema = require('../../../../app/inbound/schemas/batch')

let event

describe('batch schema', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(require('../../../mocks/events/batch').data))
  })

  test('should validate a valid batch event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should not validate a batch event with an undefined filename', () => {
    delete event.filename
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a batch event with a null filename', () => {
    event.filename = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a batch event with a non-string filename', () => {
    event.filename = 1
    expect(schema.validate(event).error).toBeDefined()
  })
})

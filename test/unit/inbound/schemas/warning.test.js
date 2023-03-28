const schema = require('../../../../app/inbound/schemas/warning')

let event

describe('warning schema', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(require('../../../mocks/events/warning').data))
  })

  test('should validate a valid warning event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should not validate a warning event with an undefined message', () => {
    delete event.message
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a warning event with a null message', () => {
    event.message = null
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate a warning event with a non-string message', () => {
    event.message = 1
    expect(schema.validate(event).error).toBeDefined()
  })
})

const schema = require('../../../app/messaging/event-schema')

let event

describe('event schema', () => {
  beforeEach(() => {
    event = JSON.parse(JSON.stringify(require('../../mocks/event')))
  })

  test('should validate a valid event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('should not validate an event with an undefind specversion', () => {
    event.specversion = undefined
    expect(schema.validate(event).error).toBeDefined()
  })
})

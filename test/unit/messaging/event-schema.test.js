const schema = require('../../../app/messaging/event-schema')

let event

describe('event schema', () => {
  beforeEach(() => {
    event = structuredClone(require('../../mocks/events/event'))
  })

  test('should validate a valid event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  const requiredFields = ['specversion', 'type', 'source', 'id', 'time']

  test.each(requiredFields)(
    'should not validate event with undefined %s',
    (field) => {
      event[field] = undefined
      expect(schema.validate(event).error).toBeDefined()
    }
  )

  test.each(requiredFields)(
    'should not validate event with null %s',
    (field) => {
      event[field] = null
      expect(schema.validate(event).error).toBeDefined()
    }
  )

  test.each(requiredFields)(
    'should not validate event with missing %s',
    (field) => {
      delete event[field]
      expect(schema.validate(event).error).toBeDefined()
    }
  )

  test.each(['specversion', 'type', 'source', 'id', 'time'])(
    'should not validate event with empty %s',
    (field) => {
      event[field] = ''
      expect(schema.validate(event).error).toBeDefined()
    }
  )

  test('should not validate event with non-uuid id', () => {
    event.id = 'a-non-uuid'
    expect(schema.validate(event).error).toBeDefined()
  })

  test('should not validate event with invalid time', () => {
    event.time = 'a-non-date'
    expect(schema.validate(event).error).toBeDefined()
  })

  const optionalFields = ['subject', 'datacontenttype', 'data']

  test.each(optionalFields)(
    'should validate event with undefined %s',
    (field) => {
      event[field] = undefined
      expect(schema.validate(event).error).toBeUndefined()
    }
  )

  test.each(['subject', 'datacontenttype'])(
    'should not validate event with null %s',
    (field) => {
      event[field] = null
      expect(schema.validate(event).error).toBeDefined()
    }
  )

  test.each(optionalFields)(
    'should validate event with missing %s',
    (field) => {
      delete event[field]
      expect(schema.validate(event).error).toBeUndefined()
    }
  )

  test.each(['subject', 'datacontenttype'])(
    'should not validate event with empty %s',
    (field) => {
      event[field] = ''
      expect(schema.validate(event).error).toBeDefined()
    }
  )

  test('should validate event with null or empty data', () => {
    event.data = null
    expect(schema.validate(event).error).toBeUndefined()
    event.data = ''
    expect(schema.validate(event).error).toBeUndefined()
  })
})

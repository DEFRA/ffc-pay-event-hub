const { REQUEST_MESSAGE } = require('../../mocks/messaging/message')

const schema = require('../../../app/messaging/message-schema')

let message

describe('message schema', () => {
  beforeEach(() => {
    message = REQUEST_MESSAGE
  })

  test('should validate a valid message', () => {
    expect(schema.validate(message).error).toBeUndefined()
  })

  test('should not validate a message with an invalid body', () => {
    message.body = 'invalid'
    expect(schema.validate(message).error).toBeDefined()
  })

  test('should not validate a message with an invalid category', () => {
    message.body.category = 'invalid'
    expect(schema.validate(message).error).toBeDefined()
  })

  test('should not validate a message with a missing category', () => {
    delete message.body.category
    expect(schema.validate(message).error).toBeDefined()
  })

  test('should not validate a message with a missing value', () => {
    delete message.body.value
    expect(schema.validate(message).error).toBeDefined()
  })
})

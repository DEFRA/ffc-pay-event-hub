const event = require('../../mocks/events/event')
const { ALERT } = require('../../../app/constants/message-types')
const { SOURCE } = require('../../../app/constants/source')
const { createMessage } = require('../../../app/messaging/create-message')

describe('createMessage', () => {
  let message

  beforeEach(() => {
    message = createMessage(event)
  })

  test('should create message with event as body', () => {
    expect(message.body).toEqual(event)
  })

  test('should create message with alert type', () => {
    expect(message.type).toEqual(ALERT)
  })

  test('should create message with source', () => {
    expect(message.source).toEqual(SOURCE)
  })
})

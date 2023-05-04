const { ALERT } = require('../../../app/constants/message-types')
const { SOURCE } = require('../../../app/constants/source')

const event = require('../../mocks/events/event')

const { createMessage } = require('../../../app/messaging/create-message')

describe('create message', () => {
  test('should create message with event as body', () => {
    const message = createMessage(event)
    expect(message.body).toEqual(event)
  })

  test('should create message with alert type', () => {
    const message = createMessage(event)
    expect(message.type).toEqual(ALERT)
  })

  test('should create message with source', () => {
    const message = createMessage(event)
    expect(message.source).toEqual(SOURCE)
  })
})

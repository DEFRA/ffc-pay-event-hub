const mockSendMessage = jest.fn()
const mockGetSender = jest.fn()

jest.mock('../../../app/messaging/service-bus', () => ({
  getSender: mockGetSender,
  sendMessage: mockSendMessage
}))

jest.mock('../../../app/messaging/create-message')
const { createMessage: mockCreateMessage } = require('../../../app/messaging/create-message')

const { sendMessage } = require('../../../app/messaging/send-message')
const { TYPE } = require('../../../app/constants/type')
const { BODY } = require('../../mocks/messaging/body')
const { SESSION_ID } = require('../../mocks/messaging/session-id')
const { RESPONSE_MESSAGE } = require('../../mocks/messaging/message')

describe('sendMessage', () => {
  let options, config, mockSender

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMessage.mockReturnValue(RESPONSE_MESSAGE)
    mockSender = { close: jest.fn() }
    mockGetSender.mockReturnValue(mockSender)
    options = { sessionId: SESSION_ID }
    config = {}
  })

  test('should create message from body, type, and options', async () => {
    await sendMessage(BODY, TYPE, config, options)
    expect(mockCreateMessage).toHaveBeenCalledWith(BODY, TYPE, options)
  })

  test('should get cached sender with config', async () => {
    await sendMessage(BODY, TYPE, config, options)
    expect(mockGetSender).toHaveBeenCalledWith(config)
  })

  test('should send message without closing cached sender', async () => {
    await sendMessage(BODY, TYPE, config, options)
    expect(mockSendMessage).toHaveBeenCalledWith(mockSender, RESPONSE_MESSAGE)
    expect(mockSender.close).not.toHaveBeenCalled()
  })
})

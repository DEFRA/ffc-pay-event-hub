const mockSendMessage = jest.fn()
const mockCloseConnection = jest.fn()

const mockMessageSender = jest.fn().mockImplementation(() => ({
  sendMessage: mockSendMessage,
  closeConnection: mockCloseConnection
}))

jest.mock('ffc-messaging', () => ({ MessageSender: mockMessageSender }))
jest.mock('../../../app/messaging/create-message')
const { createMessage: mockCreateMessage } = require('../../../app/messaging/create-message')

const { sendMessage } = require('../../../app/messaging/send-message')
const { TYPE } = require('../../../app/constants/type')
const { BODY } = require('../../mocks/messaging/body')
const { SESSION_ID } = require('../../mocks/messaging/session-id')
const { RESPONSE_MESSAGE } = require('../../mocks/messaging/message')

describe('sendMessage', () => {
  let options, config

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMessage.mockReturnValue(RESPONSE_MESSAGE)
    options = { sessionId: SESSION_ID }
    config = {}
  })

  test('should create message from body, type, and options', async () => {
    await sendMessage(BODY, TYPE, config, options)
    expect(mockCreateMessage).toHaveBeenCalledWith(BODY, TYPE, options)
  })

  test('should create message sender with config', async () => {
    await sendMessage(BODY, TYPE, config, options)
    expect(mockMessageSender).toHaveBeenCalledWith(config)
  })

  test('should send message and close connection', async () => {
    await sendMessage(BODY, TYPE, config, options)
    expect(mockSendMessage).toHaveBeenCalledWith(RESPONSE_MESSAGE)
    expect(mockCloseConnection).toHaveBeenCalled()
  })
})

const mockSendMessage = jest.fn()
const mockCloseConnection = jest.fn()

const MockMessageSender = jest.fn().mockImplementation(() => {
  return {
    sendMessage: mockSendMessage,
    closeConnection: mockCloseConnection
  }
})

jest.mock('ffc-messaging', () => {
  return {
    MessageSender: MockMessageSender
  }
})

jest.mock('../../../app/messaging/create-message')
const { createMessage: mockCreateMessage } = require('../../../app/messaging/create-message')

const { warningEvent } = require('../../mocks/events/warning')
const { MESSAGE } = require('../../mocks/messaging/message')

const { messageConfig } = require('../../../app/config')

const { sendAlert } = require('../../../app/messaging/send-alert')

describe('send alert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMessage.mockReturnValue(MESSAGE)
  })

  test('should create message from event', async () => {
    await sendAlert(warningEvent)
    expect(mockCreateMessage).toHaveBeenCalledWith(warningEvent)
  })

  test('should should create message sender from config', async () => {
    await sendAlert(warningEvent)
    expect(MockMessageSender).toHaveBeenCalledWith(messageConfig.alertTopic)
  })

  test('should send message', async () => {
    await sendAlert(warningEvent)
    expect(mockSendMessage).toHaveBeenCalledWith(MESSAGE)
  })

  test('should close connection', async () => {
    await sendAlert(warningEvent)
    expect(mockCloseConnection).toHaveBeenCalled()
  })
})

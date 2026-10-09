const mockSendMessage = jest.fn()
const mockGetSender = jest.fn()

jest.mock('../../../app/messaging/service-bus', () => ({
  getSender: mockGetSender,
  sendMessage: mockSendMessage
}))

jest.mock('../../../app/messaging/create-message')
const { createMessage: mockCreateMessage } = require('../../../app/messaging/create-message')

const { warningEvent } = require('../../mocks/events/warning')
const { RESPONSE_MESSAGE } = require('../../mocks/messaging/message')

const { messageConfig } = require('../../../app/config')
const { sendAlert } = require('../../../app/messaging/send-alert')

describe('send alert', () => {
  let mockSender

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateMessage.mockReturnValue(RESPONSE_MESSAGE)
    mockSender = { close: jest.fn() }
    mockGetSender.mockReturnValue(mockSender)
  })

  test('creates message from event', async () => {
    await sendAlert(warningEvent)
    expect(mockCreateMessage).toHaveBeenCalledWith(warningEvent)
  })

  test('gets cached sender from config', async () => {
    await sendAlert(warningEvent)
    expect(mockGetSender).toHaveBeenCalledWith(messageConfig.alertTopic)
  })

  test('sends message', async () => {
    await sendAlert(warningEvent)
    expect(mockSendMessage).toHaveBeenCalledWith(mockSender, RESPONSE_MESSAGE)
  })

  test('does not close cached sender connection', async () => {
    await sendAlert(warningEvent)
    expect(mockSender.close).not.toHaveBeenCalled()
  })
})

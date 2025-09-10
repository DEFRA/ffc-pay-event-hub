const { VALIDATION } = require('../../../app/constants/errors')

jest.mock('../../../app/inbound')
const { processEvent: mockProcessEvent } = require('../../../app/inbound')

jest.mock('../../../app/messaging/validate-event')
const { validateEvent: mockValidateEvent } = require('../../../app/messaging/validate-event')

const { sendAlert } = require('../../../app/messaging/send-alert')
jest.mock('../../../app/messaging/send-alert')

const message = require('../../mocks/events/event')

const { processEventMessage } = require('../../../app/messaging/process-event-message')

const receiver = {
  completeMessage: jest.fn(),
  deadLetterMessage: jest.fn()
}

describe('process event message', () => {
  let nowSpy

  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateEvent.mockReset()
  })

  afterEach(() => {
    if (nowSpy) {
      nowSpy.mockRestore()
    }
    jest.useRealTimers()
  })

  test('should validate message body', async () => {
    await processEventMessage(message, receiver)
    expect(mockValidateEvent).toHaveBeenCalledWith(message.body)
  })

  test('should process event', async () => {
    await processEventMessage(message, receiver)
    expect(mockProcessEvent).toHaveBeenCalledWith(message.body)
  })

  test('should complete message if validation and processing do not throw error', async () => {
    await processEventMessage(message, receiver)
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })

  test('should dead letter message if validation throws error', async () => {
    mockValidateEvent.mockImplementation(() => {
      const err = new Error('Validation error')
      err.category = VALIDATION
      throw err
    })
    await processEventMessage(message, receiver)
    expect(receiver.deadLetterMessage).toHaveBeenCalledWith(message)
  })

  test('should not complete message if validation throws error', async () => {
    mockValidateEvent.mockImplementation(() => {
      const err = new Error('Validation error')
      err.category = VALIDATION
      throw err
    })
    await processEventMessage(message, receiver)
    expect(receiver.completeMessage).not.toHaveBeenCalledWith(message)
  })

  test('should not dead letter message if processing throws error', async () => {
    mockProcessEvent.mockImplementation(() => {
      throw new Error('Processing error')
    })
    await processEventMessage(message, receiver)
    expect(receiver.deadLetterMessage).not.toHaveBeenCalled()
  })

  test('should not complete message if processing throws error', async () => {
    mockProcessEvent.mockImplementation(() => {
      throw new Error('Processing error')
    })
    await processEventMessage(message, receiver)
    expect(receiver.completeMessage).not.toHaveBeenCalledWith(message)
  })

  test('should correctly handle alerts based on time passing', async () => {
    jest.useFakeTimers()
    const oneHourInMilliseconds = 3600000
    const alertTime = Date.now() + oneHourInMilliseconds
    nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => alertTime)
    mockProcessEvent.mockImplementation(() => {
      throw new Error('Processing error')
    })
    await processEventMessage(message, receiver)
    expect(sendAlert).toHaveBeenCalledWith(expect.objectContaining({
      type: expect.any(String),
      source: expect.any(String),
      id: expect.any(String),
      data: expect.objectContaining({
        message: expect.stringContaining('Processing error'),
        originalEvent: message.body
      })
    }))
    await processEventMessage(message, receiver)
    expect(sendAlert).toHaveBeenCalledTimes(1)
  })
})

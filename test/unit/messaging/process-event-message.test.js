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

  test('validates and processes message', async () => {
    await processEventMessage(message, receiver)
    expect(mockValidateEvent).toHaveBeenCalledWith(message.body)
    expect(mockProcessEvent).toHaveBeenCalledWith(message.body)
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })

  describe('validation errors', () => {
    beforeEach(() => {
      mockValidateEvent.mockImplementation(() => {
        const err = new Error('Validation error')
        err.category = VALIDATION
        throw err
      })
    })

    test('dead letters message if validation throws', async () => {
      await processEventMessage(message, receiver)
      expect(receiver.deadLetterMessage).toHaveBeenCalledWith(message)
      expect(receiver.completeMessage).not.toHaveBeenCalled()
    })
  })

  describe('processing errors', () => {
    beforeEach(() => {
      mockProcessEvent.mockImplementation(() => {
        throw new Error('Processing error')
      })
    })

    test('does not complete or dead letter message on processing error', async () => {
      await processEventMessage(message, receiver)
      expect(receiver.completeMessage).not.toHaveBeenCalled()
      expect(receiver.deadLetterMessage).not.toHaveBeenCalled()
    })

    test('sends alert on processing error', async () => {
      jest.useFakeTimers()
      const oneHour = 3600000
      const realNow = Date.now()
      nowSpy = jest.spyOn(Date, 'now').mockImplementation(() => realNow + oneHour)

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
})

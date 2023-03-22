const { VALIDATION } = require('../../../app/constants/errors')

jest.mock('../../../app/inbound')
const { processEvent: mockProcessEvent } = require('../../../app/inbound')

jest.mock('../../../app/messaging/validate-event')
const { validateEvent: mockValidateEvent } = require('../../../app/messaging/validate-event')

const message = require('../../mocks/event')

const { processEventMessage } = require('../../../app/messaging/process-event-message')

const receiver = {
  completeMessage: jest.fn(),
  deadLetterMessage: jest.fn()
}

describe('process event message', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateEvent.mockReset()
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
})

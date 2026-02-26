jest.mock('../../../app/messaging/validate-message')
jest.mock('../../../app/messaging/send-message')
jest.mock('../../../app/data-requests')

const {
  validateMessage: mockValidateMessage
} = require('../../../app/messaging/validate-message')

const {
  sendMessage: mockSendMessage
} = require('../../../app/messaging/send-message')

const {
  processDataExportRequest: mockProcessDataExportRequest
} = require('../../../app/data-requests')

const { messageConfig } = require('../../../app/config')
const { REQUEST_MESSAGE } = require('../../mocks/messaging/message')
const { CATEGORY } = require('../../mocks/values/category')
const { REQUEST_VALUE } = require('../../mocks/request-value')
const { TYPE } = require('../../../app/constants/type')
const { VALIDATION } = require('../../../app/constants/errors')

const {
  processDataMessage
} = require('../../../app/messaging/process-data-message')

describe('processDataMessage', () => {
  let receiver

  beforeEach(() => {
    jest.clearAllMocks()

    mockProcessDataExportRequest.mockResolvedValue(
      'http://example.com/blob/test-file.json'
    )

    receiver = {
      completeMessage: jest.fn(),
      abandonMessage: jest.fn(),
      deadLetterMessage: jest.fn()
    }
  })

  test('should validate the message', async () => {
    await processDataMessage(REQUEST_MESSAGE, receiver)

    expect(mockValidateMessage).toHaveBeenCalledWith(REQUEST_MESSAGE)
  })

  test('should process data export request', async () => {
    await processDataMessage(REQUEST_MESSAGE, receiver)

    expect(mockProcessDataExportRequest).toHaveBeenCalledWith(
      CATEGORY,
      REQUEST_VALUE
    )
  })

  test('should send response message with blob filename only', async () => {
    await processDataMessage(REQUEST_MESSAGE, receiver)

    expect(mockSendMessage).toHaveBeenCalledWith(
      { uri: 'test-file.json' },
      TYPE,
      messageConfig.dataQueue,
      { sessionId: REQUEST_MESSAGE.messageId }
    )
  })

  test('should complete the message if processing succeeds', async () => {
    await processDataMessage(REQUEST_MESSAGE, receiver)

    expect(receiver.completeMessage).toHaveBeenCalledWith(REQUEST_MESSAGE)
  })

  test('should abandon message on non-validation errors', async () => {
    mockProcessDataExportRequest.mockRejectedValue(
      new Error('Unexpected error')
    )

    await processDataMessage(REQUEST_MESSAGE, receiver)

    expect(receiver.abandonMessage).toHaveBeenCalledWith(REQUEST_MESSAGE)
  })

  test('should dead-letter message on validation errors', async () => {
    mockValidateMessage.mockImplementation(() => {
      const err = new Error('Validation error')
      err.category = VALIDATION
      throw err
    })

    await processDataMessage(REQUEST_MESSAGE, receiver)

    expect(receiver.deadLetterMessage).toHaveBeenCalledWith(REQUEST_MESSAGE)
  })
})

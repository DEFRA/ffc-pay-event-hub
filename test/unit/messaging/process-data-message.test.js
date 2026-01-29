jest.mock('../../../app/messaging/validate-message')
jest.mock('../../../app/cache')
jest.mock('../../../app/messaging/send-message')
jest.mock('../../../app/outbound')
jest.mock('../../../app/storage')

const { validateMessage: mockValidateMessage } = require('../../../app/messaging/validate-message')
const { getCachedResponse: mockGetCachedResponse, setCachedResponse: mockSetCachedResponse, getCacheKey: mockGetCacheKey } = require('../../../app/cache')
const { sendMessage: mockSendMessage } = require('../../../app/messaging/send-message')
const { getData: mockGetData } = require('../../../app/outbound')
const { writeDataRequestFile: mockWriteDataRequestFile } = require('../../../app/storage')

const { cacheConfig, messageConfig } = require('../../../app/config')
const { REQUEST_MESSAGE } = require('../../mocks/messaging/message')
const { CATEGORY } = require('../../mocks/values/category')
const { REQUEST_VALUE } = require('../../mocks/cache/request-value')
const { REQUEST } = require('../../mocks/request')
const { RESPONSE } = require('../../mocks/values/response')
const { KEY } = require('../../mocks/cache/key')
const { TYPE } = require('../../../app/constants/type')
const { VALIDATION } = require('../../../app/constants/errors')

const { processDataMessage } = require('../../../app/messaging/process-data-message')

describe('processDataMessage', () => {
  let receiver

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCacheKey.mockReturnValue(KEY)
    mockGetCachedResponse.mockResolvedValue(RESPONSE)
    mockWriteDataRequestFile.mockResolvedValue({ url: 'http://example.com/blob' })
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

  test('should retrieve cached response if available', async () => {
    await processDataMessage(REQUEST_MESSAGE, receiver)
    expect(mockGetCachedResponse).toHaveBeenCalledWith(cacheConfig.cache, REQUEST, KEY)
  })

  test('should get data if no cached response and set cache', async () => {
    mockGetCachedResponse.mockResolvedValue(null)
    await processDataMessage(REQUEST_MESSAGE, receiver)
    expect(mockGetData).toHaveBeenCalledWith(CATEGORY, REQUEST_VALUE)
    expect(mockSetCachedResponse).toHaveBeenCalledWith(cacheConfig.cache, KEY, REQUEST, RESPONSE)
  })

  test('should write data request file and send response message', async () => {
    await processDataMessage(REQUEST_MESSAGE, receiver)
    expect(mockWriteDataRequestFile).toHaveBeenCalledWith(`${REQUEST_MESSAGE.messageId}.json`, JSON.stringify(RESPONSE))
    expect(mockSendMessage).toHaveBeenCalledWith(
      { uri: 'http://example.com/blob' },
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
    mockGetCachedResponse.mockRejectedValue(new Error('Unexpected error'))
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

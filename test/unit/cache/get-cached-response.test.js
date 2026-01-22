jest.mock('../../../app/cache/get')
const { get: mockGet } = require('../../../app/cache/get')

jest.mock('../../../app/cache/update')
const { update: mockUpdate } = require('../../../app/cache/update')

jest.mock('../../../app/cache/get-request-index')
const { getRequestIndex: mockGetRequestIndex } = require('../../../app/cache/get-request-index')

const { NAME } = require('../../mocks/cache/name')
const { KEY } = require('../../mocks/cache/key')
const { DATA } = require('../../mocks/cache/data')
const { REQUEST } = require('../../mocks/request')
const { RESPONSE } = require('../../mocks/values/response')

const { getCachedResponse } = require('../../../app/cache/get-cached-response')

describe('getCachedResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue(DATA)
    mockGetRequestIndex.mockReturnValue(0)
  })

  test('should get from cache, check index, and return cached response', async () => {
    const response = await getCachedResponse(NAME, REQUEST, KEY)
    expect(mockGet).toHaveBeenCalledWith(NAME, KEY)
    expect(mockGetRequestIndex).toHaveBeenCalledWith(DATA, REQUEST)
    expect(response).toEqual(RESPONSE)
  })

  test('should return undefined if request not in cache', async () => {
    mockGetRequestIndex.mockReturnValue(-1)
    const response = await getCachedResponse(NAME, REQUEST, KEY)
    expect(response).toBeUndefined()
  })

  test('should add new request to cache if it does not exist', async () => {
    mockGet.mockResolvedValue({})
    await getCachedResponse(NAME, REQUEST, KEY)
    expect(mockUpdate).toHaveBeenCalledWith(NAME, KEY, { requests: [{ request: REQUEST }] })
  })
})

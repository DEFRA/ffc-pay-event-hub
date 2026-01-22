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

const { setCachedResponse } = require('../../../app/cache/set-cached-response')

describe('set cached response', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue(DATA)
    mockGetRequestIndex.mockReturnValue(0)
  })

  test('should get cache, check request index, and update', async () => {
    await setCachedResponse(NAME, KEY, REQUEST, RESPONSE)
    expect(mockGet).toHaveBeenCalledWith(NAME, KEY)
    expect(mockGetRequestIndex).toHaveBeenCalledWith(DATA, REQUEST)
    expect(mockUpdate).toHaveBeenCalledWith(NAME, KEY, DATA)
  })

  test('should add new request if not in cache', async () => {
    mockGetRequestIndex.mockReturnValue(-1)
    await setCachedResponse(NAME, KEY, REQUEST, RESPONSE)
    expect(mockUpdate).toHaveBeenCalledWith(NAME, KEY, DATA)
  })
})

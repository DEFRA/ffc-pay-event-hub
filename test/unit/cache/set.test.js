const mockClient = { set: jest.fn(), expire: jest.fn() }

jest.mock('../../../app/cache/base')
const { getClient: mockGetClient } = require('../../../app/cache/base')

jest.mock('../../../app/cache/get-full-key')
const { getFullKey: mockGetFullKey } = require('../../../app/cache/get-full-key')

const { PREFIX } = require('../../mocks/cache/prefix')
const { NAME } = require('../../mocks/cache/name')
const { KEY } = require('../../mocks/cache/key')
const { VALUE, VALUE_STRING } = require('../../mocks/cache/value')

const { cacheConfig } = require('../../../app/config')
const { set } = require('../../../app/cache/set')

describe('cache set', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetClient.mockReturnValue(mockClient)
    mockGetFullKey.mockReturnValue(PREFIX)
  })

  test('should get full key, set value, and apply expiration', async () => {
    await set(NAME, KEY, VALUE)
    expect(mockGetFullKey).toHaveBeenCalledWith(NAME, KEY)
    expect(mockClient.set).toHaveBeenCalledWith(PREFIX, VALUE_STRING)
    expect(mockClient.expire).toHaveBeenCalledWith(PREFIX, cacheConfig.ttl)
  })
})

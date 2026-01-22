const mockClient = { get: jest.fn() }

jest.mock('../../../app/cache/base')
const { getClient: mockGetClient } = require('../../../app/cache/base')

jest.mock('../../../app/cache/get-full-key')
const { getFullKey: mockGetFullKey } = require('../../../app/cache/get-full-key')

const { PREFIX } = require('../../mocks/cache/prefix')
const { NAME } = require('../../mocks/cache/name')
const { KEY } = require('../../mocks/cache/key')
const { VALUE, VALUE_STRING } = require('../../mocks/cache/value')

const { get } = require('../../../app/cache/get')

describe('cache get', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetClient.mockReturnValue(mockClient)
    mockGetFullKey.mockReturnValue(PREFIX)
    mockClient.get.mockResolvedValue(VALUE_STRING)
  })

  test('should get full key from cache and return value', async () => {
    const value = await get(NAME, KEY)
    expect(mockGetFullKey).toHaveBeenCalledWith(NAME, KEY)
    expect(mockClient.get).toHaveBeenCalledWith(PREFIX)
    expect(value).toEqual(VALUE)
  })

  test('should return empty object if value is not in cache', async () => {
    mockClient.get.mockResolvedValue(null)
    const value = await get(NAME, KEY)
    expect(value).toEqual({})
  })
})

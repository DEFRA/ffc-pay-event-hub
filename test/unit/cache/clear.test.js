const mockClient = { del: jest.fn() }

jest.mock('../../../app/cache/base')
const { getClient: mockGetClient } = require('../../../app/cache/base')

jest.mock('../../../app/cache/get-full-key')
const { getFullKey: mockGetFullKey } = require('../../../app/cache/get-full-key')

const { PREFIX } = require('../../mocks/cache/prefix')
const { NAME } = require('../../mocks/cache/name')
const { KEY } = require('../../mocks/cache/key')

const { clear } = require('../../../app/cache/clear')

describe('cache clear', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetClient.mockReturnValue(mockClient)
    mockGetFullKey.mockReturnValue(PREFIX)
  })

  test('should get full key and delete it from cache', async () => {
    await clear(NAME, KEY)
    expect(mockGetFullKey).toHaveBeenCalledWith(NAME, KEY)
    expect(mockClient.del).toHaveBeenCalledWith(PREFIX)
  })
})

jest.mock('../../../app/cache/get-key-prefix')
const { getKeyPrefix: mockGetKeyPrefix } = require('../../../app/cache/get-key-prefix')

const { PREFIX } = require('../../mocks/cache/prefix')
const { NAME } = require('../../mocks/cache/name')
const { KEY } = require('../../mocks/cache/key')

const { getFullKey } = require('../../../app/cache/get-full-key')

describe('get full key', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetKeyPrefix.mockReturnValue(PREFIX)
  })
  test('should get key prefix from cache name', () => {
    getFullKey(NAME, KEY)
    expect(mockGetKeyPrefix).toHaveBeenCalledWith(NAME)
  })

  test('should return full key from prefix and key', () => {
    const fullKey = getFullKey(NAME, KEY)
    expect(fullKey).toEqual(`${PREFIX}:${KEY}`)
  })
})

const mockClient = {
  flushAll: jest.fn()
}

jest.mock('../../../app/cache/base')
const { getClient: mockGetClient } = require('../../../app/cache/base')

const { flushAll } = require('../../../app/cache/flush-all')

describe('cache flush', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetClient.mockReturnValue(mockClient)
  })

  test('should flush all from cache once', async () => {
    await flushAll()
    expect(mockClient.flushAll).toHaveBeenCalledTimes(1)
  })
})

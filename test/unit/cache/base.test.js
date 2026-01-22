const mockOn = jest.fn()
const mockConnect = jest.fn()
const mockDisconnect = jest.fn()

const mockClient = { on: mockOn, connect: mockConnect, disconnect: mockDisconnect }

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockClient)
}))

const mockRedis = require('redis')
const { start, stop } = require('../../../app/cache/base')

describe('cache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should create client and connect once on start', async () => {
    await start()
    expect(mockRedis.createClient).toHaveBeenCalledTimes(1)
    expect(mockConnect).toHaveBeenCalledTimes(1)
  })

  test.each([
    'error',
    'reconnecting',
    'ready'
  ])('should setup %s listener on start', async (event) => {
    await start()
    expect(mockOn).toHaveBeenCalledWith(event, expect.any(Function))
  })

  test('should only setup three listeners on start', async () => {
    await start()
    expect(mockOn).toHaveBeenCalledTimes(3)
  })

  test('should disconnect once on stop', async () => {
    await start()
    await stop()
    expect(mockDisconnect).toHaveBeenCalledTimes(1)
  })
})

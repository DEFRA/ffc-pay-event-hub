const config = require('../../../app/config/message')
const mockSubscribe = jest.fn()
const mockCloseConnection = jest.fn()
const MockReceiver = jest.fn().mockImplementation(() => {
  return {
    subscribe: mockSubscribe,
    closeConnection: mockCloseConnection
  }
})
jest.mock('ffc-messaging', () => {
  return {
    MessageReceiver: MockReceiver
  }
})
jest.mock('../../../app/storage')
const messageService = require('../../../app/messaging')

describe('messaging', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates receiver for events topic', async () => {
    await messageService.start()
    expect(MockReceiver).toHaveBeenCalledWith(config.eventSubscription, expect.anything())
  })

  test('subscribes to topic', async () => {
    await messageService.start()
    expect(mockSubscribe).toHaveBeenCalledTimes(1)
  })

  test('closes connection when stopped', async () => {
    await messageService.stop()
    expect(mockCloseConnection).toHaveBeenCalledTimes(1)
  })
})

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

  test('creates receiver for events and data topics', async () => {
    await messageService.start()
    expect(MockReceiver).toHaveBeenCalledWith(config.eventsSubscription, expect.any(Function))
    expect(MockReceiver).toHaveBeenCalledWith(config.dataSubscription, expect.any(Function))
  })

  test('creates receiver for retention topic', async () => {
    await messageService.start()
    expect(MockReceiver).toHaveBeenCalledWith(config.retentionSubscription, expect.any(Function))
  })

  test('subscribes to all topics', async () => {
    await messageService.start()
    expect(mockSubscribe).toHaveBeenCalledTimes(3)
  })

  test('closes connections for all receivers when stopped', async () => {
    await messageService.start()
    await messageService.stop()
    expect(mockCloseConnection).toHaveBeenCalledTimes(3)
  })

  test('logs readiness message after starting', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => { })
    await messageService.start()
    expect(consoleInfoSpy).toHaveBeenCalledWith('Ready to receive messages')
    consoleInfoSpy.mockRestore()
  })
})

const mockCreateServiceBusClient = jest.fn()
const mockCreateReceiver = jest.fn()
const mockSubscribeReceiver = jest.fn()
const mockCloseSenders = jest.fn()

jest.mock('../../../app/messaging/service-bus', () => ({
  createServiceBusClient: mockCreateServiceBusClient,
  createReceiver: mockCreateReceiver,
  subscribeReceiver: mockSubscribeReceiver,
  closeSenders: mockCloseSenders
}))

jest.mock('../../../app/messaging/process-event-message')
jest.mock('../../../app/messaging/process-data-message')
jest.mock('../../../app/messaging/process-retention-message')

const mockCreateDiagnosticsHandler = jest.fn()
jest.mock('../../../app/messaging/diagnostics', () => ({
  createDiagnosticsHandler: mockCreateDiagnosticsHandler
}))

jest.mock('../../../app/storage')

const config = require('../../../app/config/message')
const messageService = require('../../../app/messaging')

describe('messaging', () => {
  let mockSbClient
  let mockEventsReceiver
  let mockDataReceiver
  let mockRetentionReceiver

  beforeEach(() => {
    jest.clearAllMocks()

    mockSbClient = { close: jest.fn() }
    mockCreateServiceBusClient.mockReturnValue(mockSbClient)

    mockEventsReceiver = { close: jest.fn() }
    mockDataReceiver = { close: jest.fn() }
    mockRetentionReceiver = { close: jest.fn() }

    mockCreateReceiver
      .mockReturnValueOnce(mockEventsReceiver)
      .mockReturnValueOnce(mockDataReceiver)
      .mockReturnValueOnce(mockRetentionReceiver)

    mockCreateDiagnosticsHandler.mockReturnValue('diagnostics-handler')
  })

  test('creates service bus client', async () => {
    await messageService.start()
    expect(mockCreateServiceBusClient).toHaveBeenCalledWith(config.eventsSubscription)
  })

  test('creates receivers for events, data, and retention subscriptions', async () => {
    await messageService.start()
    expect(mockCreateReceiver).toHaveBeenCalledWith(mockSbClient, config.eventsSubscription)
    expect(mockCreateReceiver).toHaveBeenCalledWith(mockSbClient, config.dataSubscription)
    expect(mockCreateReceiver).toHaveBeenCalledWith(mockSbClient, config.retentionSubscription)
  })

  test('subscribes to all receivers', async () => {
    await messageService.start()
    expect(mockSubscribeReceiver).toHaveBeenCalledTimes(3)
    expect(mockSubscribeReceiver).toHaveBeenCalledWith(
      mockEventsReceiver,
      expect.any(Function),
      'diagnostics-handler',
      config.eventsSubscription
    )
    expect(mockSubscribeReceiver).toHaveBeenCalledWith(
      mockDataReceiver,
      expect.any(Function),
      'diagnostics-handler',
      config.dataSubscription
    )
    expect(mockSubscribeReceiver).toHaveBeenCalledWith(
      mockRetentionReceiver,
      expect.any(Function),
      'diagnostics-handler',
      config.retentionSubscription
    )
  })

  test('creates diagnostics handlers for each receiver', async () => {
    await messageService.start()
    expect(mockCreateDiagnosticsHandler).toHaveBeenCalledWith('events-receiver')
    expect(mockCreateDiagnosticsHandler).toHaveBeenCalledWith('data-receiver')
    expect(mockCreateDiagnosticsHandler).toHaveBeenCalledWith('retention-receiver')
  })

  test('closes senders, receivers, and client when stopped', async () => {
    await messageService.start()
    await messageService.stop()
    expect(mockCloseSenders).toHaveBeenCalled()
    expect(mockEventsReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockDataReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockRetentionReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockSbClient.close).toHaveBeenCalledTimes(1)

    await messageService.stop()
    expect(mockEventsReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockDataReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockRetentionReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockSbClient.close).toHaveBeenCalledTimes(1)
  })

  test('continues closing resources and logs when a receiver close fails', async () => {
    const closeError = new Error('receiver close failed')
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockEventsReceiver.close.mockRejectedValueOnce(closeError)

    await messageService.start()
    await messageService.stop()

    expect(mockEventsReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockDataReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockRetentionReceiver.close).toHaveBeenCalledTimes(1)
    expect(mockSbClient.close).toHaveBeenCalledTimes(1)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing events receiver:', closeError)
    consoleErrorSpy.mockRestore()
  })

  test('logs readiness message after starting', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => { })
    await messageService.start()
    expect(consoleInfoSpy).toHaveBeenCalledWith('Ready to receive messages')
    consoleInfoSpy.mockRestore()
  })
})

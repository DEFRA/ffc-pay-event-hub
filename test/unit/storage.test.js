const { TableClient } = require('@azure/data-tables')
const { initialiseTables, getClient } = require('../../app/storage')
const { storageConfig } = require('../../app/config')
const { sendAlert } = require('../../app/messaging/send-alert')

jest.mock('@azure/data-tables')
jest.mock('../../app/messaging/send-alert')

describe('initialiseTables', () => {
  let mockTableClient

  beforeEach(() => {
    mockTableClient = {
      createTable: jest.fn().mockResolvedValue(undefined)
    }
    TableClient.mockImplementation(() => mockTableClient)
    TableClient.fromConnectionString = jest.fn().mockReturnValue(mockTableClient)
  })

  test('should initialize TableClients using DefaultAzureCredential', async () => {
    storageConfig.useConnectionString = false
    await initialiseTables()

    expect(TableClient).toHaveBeenCalledTimes(4)
    expect(TableClient.fromConnectionString).not.toHaveBeenCalled()
    expect(mockTableClient.createTable).toHaveBeenCalledTimes(4)
  })

  test('should initialize TableClients using connection string', async () => {
    storageConfig.useConnectionString = true
    await initialiseTables()

    expect(TableClient.fromConnectionString).toHaveBeenCalledTimes(4)
    expect(mockTableClient.createTable).toHaveBeenCalledTimes(4)
  })

  test('should handle initialisation errors and send alert', async () => {
    mockTableClient.createTable.mockImplementationOnce(() => {
      const error = new Error('Connection failed')
      error.statusCode = 500
      throw error
    })

    console.error = jest.fn()
    await initialiseTables()

    expect(console.error).toHaveBeenCalledWith('Error creating tables', expect.any(Error))
    expect(sendAlert).toHaveBeenCalled()
  })
})

describe('getClient returns or errors correctly', () => {
  test('payment event type returns', () => {
    const paymentEventType = 'PAYMENT_EVENT'
    expect(() => getClient(paymentEventType)).toBeTruthy()
  })

  test('hold event type returns', () => {
    const holdEventType = 'HOLD_EVENT'
    expect(() => getClient(holdEventType)).toBeTruthy()
  })

  test('warning event type returns', () => {
    const warningEventType = 'WARNING_EVENT'
    expect(() => getClient(warningEventType)).toBeTruthy()
  })

  test('batch event type returns', () => {
    const batchEventType = 'BATCH_EVENT'
    expect(() => getClient(batchEventType)).toBeTruthy()
  })

  test('throws an error for unknown event type', () => {
    const unknownEventType = 'UNKNOWN_EVENT'
    expect(() => getClient(unknownEventType)).toThrow(`Unknown event type: ${unknownEventType}`)
  })
})

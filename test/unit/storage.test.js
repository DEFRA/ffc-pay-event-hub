const { TableClient } = require('@azure/data-tables')
const { initialiseTables, getClient } = require('../../app/storage')
const { storageConfig } = require('../../app/config')

jest.mock('@azure/data-tables')

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

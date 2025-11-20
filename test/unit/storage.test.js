const { TableClient } = require('@azure/data-tables')
const { initialiseTables, getClient } = require('../../app/storage')
const { storageConfig } = require('../../app/config')
const { sendAlert } = require('../../app/messaging/send-alert')
const {
  PAYMENT_EVENT,
  HOLD_EVENT,
  WARNING_EVENT,
  BATCH_EVENT
} = require('../../app/constants/event-types')

jest.mock('@azure/data-tables')
jest.mock('../../app/messaging/send-alert')

describe('initialiseTables', () => {
  let mockTableClient

  beforeEach(() => {
    mockTableClient = { createTable: jest.fn().mockResolvedValue() }
    TableClient.mockImplementation(() => mockTableClient)
    TableClient.fromConnectionString = jest.fn().mockReturnValue(mockTableClient)
    console.error = jest.fn()
  })

  test('initialises TableClients using DefaultAzureCredential', async () => {
    storageConfig.useConnectionString = false
    await initialiseTables()
    expect(TableClient).toHaveBeenCalledTimes(4)
    expect(TableClient.fromConnectionString).not.toHaveBeenCalled()
    expect(mockTableClient.createTable).toHaveBeenCalledTimes(4)
  })

  test('initialises TableClients using connection string', async () => {
    storageConfig.useConnectionString = true
    await initialiseTables()
    expect(TableClient.fromConnectionString).toHaveBeenCalledTimes(4)
    expect(mockTableClient.createTable).toHaveBeenCalledTimes(4)
  })

  test('handles initialisation errors and sends alert', async () => {
    mockTableClient.createTable.mockImplementationOnce(() => {
      const error = new Error('Connection failed')
      error.statusCode = 500
      throw error
    })
    await initialiseTables()
    expect(console.error).toHaveBeenCalledWith('Error creating tables', expect.any(Error))
    expect(sendAlert).toHaveBeenCalled()
  })
})

describe('getClient', () => {
  const clients = [
    [PAYMENT_EVENT],
    [HOLD_EVENT],
    [WARNING_EVENT],
    [BATCH_EVENT]
  ]

  test.each(clients)('returns a client for %s', (eventType) => {
    expect(getClient(eventType)).toBeTruthy()
  })

  test('throws an error for unknown event type', () => {
    const unknownEventType = 'UNKNOWN_EVENT'
    expect(() => getClient(unknownEventType)).toThrow(
      `Unknown event type: ${unknownEventType}`
    )
  })
})

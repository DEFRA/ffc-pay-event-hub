const config = require('../../app/config/storage')
const { PAYMENT_EVENT, BATCH_EVENT, HOLD_EVENT, WARNING_EVENT } = require('../../app/constants/event-types')

const mockTableClient = {
  createTable: jest.fn()
}
jest.mock('@azure/data-tables', () => {
  return {
    TableClient: {
      fromConnectionString: jest.fn().mockReturnValue(mockTableClient)
    }
  }
})
jest.mock('@azure/identity')

const { initialiseTables, getClient } = require('../../app/storage')

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should create payment table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.paymentTable)
  })

  test('should create batches table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.batchTable)
  })

  test('should create hold table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.holdTable)
  })

  test('should create warning table when initialising tables', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledWith(config.warningTable)
  })

  test('should create each table once', async () => {
    await initialiseTables()
    expect(mockTableClient.createTable).toHaveBeenCalledTimes(4)
  })

  test('getClient should return payment client if payment event', async () => {
    await initialiseTables()
    const client = getClient(PAYMENT_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should return batch client if payment event', async () => {
    await initialiseTables()
    const client = getClient(BATCH_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should return hold client if payment event', async () => {
    await initialiseTables()
    const client = getClient(HOLD_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should return warning client if payment event', async () => {
    await initialiseTables()
    const client = getClient(WARNING_EVENT)
    expect(client).toBeDefined()
  })

  test('getClient should throw error for unknown event', async () => {
    await initialiseTables()
    expect(() => getClient('unknown')).toThrow()
  })
})

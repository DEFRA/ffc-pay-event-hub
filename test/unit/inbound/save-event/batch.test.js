const { randomUUID } = require('node:crypto')
const { BATCH } = require('../../../../app/constants/categories')

jest.mock('node:crypto', () => ({ randomUUID: jest.fn() }))
const mockUuid = 'test-uuid-1234'
randomUUID.mockReturnValue(mockUuid)

const { createKnexMock } = require('../../../helpers/mock-knex')
const mockDb = createKnexMock(['batches'])
jest.mock('../../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp
} = require('../../../../app/inbound/save-event/get-timestamp')
const mockTimestamp = 1234567890
mockGetTimestamp.mockReturnValue(mockTimestamp)

const { saveBatchEvent } = require('../../../../app/inbound/save-event/batch')
const event = require('../../../mocks/events/batch')

describe('save batch event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('calls getTimestamp with event time', async () => {
    await saveBatchEvent(event)
    expect(mockGetTimestamp).toHaveBeenCalledWith(event.time)
  })

  test('generates a UUID for the batch record', async () => {
    await saveBatchEvent(event)
    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  test('creates one batch record in the batches table', async () => {
    await saveBatchEvent(event)
    expect(mockDb.tables.batches).toHaveBeenCalledWith()
    expect(mockDb.builder.insert).toHaveBeenCalledTimes(1)
  })

  test('propagates a database failure', async () => {
    mockDb.builder.rejects(new Error('DB error'))
    await expect(saveBatchEvent(event)).rejects.toThrow('DB error')
  })

  test('creates batch record with correct structure', async () => {
    await saveBatchEvent(event)
    expect(mockDb.builder.insert).toHaveBeenCalledWith({
      id: mockUuid,
      partitionKey: event.data.filename,
      timestamp: new Date(mockTimestamp).toISOString(),
      rowKey: mockTimestamp.toString(),
      category: BATCH,
      source: event.source,
      subject: event.subject,
      time: new Date(event.time).toISOString(),
      type: event.type,
      data: JSON.stringify(JSON.stringify(event.data))
    })
  })

  test('uses filename as partition key', async () => {
    await saveBatchEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.partitionKey).toBe(event.data.filename)
  })

  test('uses timestamp as rowKey', async () => {
    await saveBatchEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.rowKey).toBe(mockTimestamp.toString())
  })

  test('stores event data as a JSON string value', async () => {
    await saveBatchEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(JSON.parse(callArg.data)).toBe(JSON.stringify(event.data))
  })

  test('sets category to BATCH', async () => {
    await saveBatchEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.category).toBe(BATCH)
  })
})

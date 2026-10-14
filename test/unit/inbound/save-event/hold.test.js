const { randomUUID } = require('node:crypto')
const { FRN, SCHEME_ID } = require('../../../../app/constants/categories')

jest.mock('node:crypto', () => ({ randomUUID: jest.fn() }))
const mockUuids = ['uuid-1', 'uuid-2', 'uuid-3']
let uuidCallCount = 0
randomUUID.mockImplementation(() => {
  const uuid = mockUuids[uuidCallCount]
  uuidCallCount++
  return uuid
})

const { createKnexMock } = require('../../../helpers/mock-knex')
const mockDb = createKnexMock(['holds'])
jest.mock('../../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

jest.mock('../../../../app/inbound/save-event/create-row')
const {
  createRow: mockCreateRow
} = require('../../../../app/inbound/save-event/create-row')
mockCreateRow.mockImplementation((partitionKey, rowKey, category, event) => ({
  partitionKey,
  rowKey,
  category,
  source: event.source,
  subject: event.subject,
  time: event.time,
  type: event.type,
  data: event.data
}))

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp
} = require('../../../../app/inbound/save-event/get-timestamp')
const mockTimestamp = 9988776655
mockGetTimestamp.mockReturnValue(mockTimestamp)

const { saveHoldEvent } = require('../../../../app/inbound/save-event/hold')
const event = require('../../../mocks/events/hold')

describe('save hold event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
    uuidCallCount = 0
  })

  test('calls getTimestamp with event time', async () => {
    await saveHoldEvent(event)
    expect(mockGetTimestamp).toHaveBeenCalledWith(event.time)
  })

  test('creates row with FRN partition key and schemeId row key', async () => {
    await saveHoldEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(
      event.data.frn,
      event.data.schemeId,
      FRN,
      event
    )
  })

  test('creates row with SCHEME_ID partition key and frn row key', async () => {
    await saveHoldEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(
      event.data.schemeId,
      event.data.frn,
      SCHEME_ID,
      event
    )
  })

  test('creates row with holdCategoryId partition key and frn row key', async () => {
    await saveHoldEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(
      event.data.holdCategoryId,
      event.data.frn,
      SCHEME_ID,
      event
    )
  })

  test('creates exactly 3 rows', async () => {
    await saveHoldEvent(event)
    expect(mockCreateRow).toHaveBeenCalledTimes(3)
  })

  test('generates UUID for each record', async () => {
    await saveHoldEvent(event)
    expect(randomUUID).toHaveBeenCalledTimes(3)
  })

  test('inserts all records into the holds table in one statement', async () => {
    await saveHoldEvent(event)
    expect(mockDb.tables.holds).toHaveBeenCalledWith()
    expect(mockDb.builder.insert).toHaveBeenCalledTimes(1)
  })

  test('propagates a database failure', async () => {
    mockDb.builder.rejects(new Error('DB error'))
    await expect(saveHoldEvent(event)).rejects.toThrow('DB error')
  })

  test('creates records with correct structure', async () => {
    const holdEvent = {
      ...event,
      data: {
        ...event.data,
        frn: '9876543210',
        schemeId: 'scheme-789',
        holdCategoryId: 'hold-cat-123'
      }
    }
    await saveHoldEvent(holdEvent)

    const records = mockDb.builder.insert.mock.calls[0][0]
    expect(records).toHaveLength(3)

    expect(records[0]).toEqual({
      id: mockUuids[0],
      partitionKey: '9876543210',
      rowKey: 'scheme-789',
      timestamp: new Date(mockTimestamp).toISOString(),
      category: FRN,
      source: event.source,
      time: new Date(event.time).toISOString(),
      type: event.type,
      data: JSON.stringify(holdEvent.data)
    })

    expect(records[1]).toEqual({
      id: mockUuids[1],
      partitionKey: 'scheme-789',
      rowKey: '9876543210',
      timestamp: new Date(mockTimestamp).toISOString(),
      category: SCHEME_ID,
      source: event.source,
      time: new Date(event.time).toISOString(),
      type: event.type,
      data: JSON.stringify(holdEvent.data)
    })

    expect(records[2]).toEqual({
      id: mockUuids[2],
      partitionKey: 'hold-cat-123',
      rowKey: '9876543210',
      timestamp: new Date(mockTimestamp).toISOString(),
      category: SCHEME_ID,
      source: event.source,
      time: new Date(event.time).toISOString(),
      type: event.type,
      data: JSON.stringify(holdEvent.data)
    })
  })

  test('all records have same timestamp', async () => {
    await saveHoldEvent(event)

    const records = mockDb.builder.insert.mock.calls[0][0]
    records.forEach((record) => {
      expect(record.timestamp).toBe(new Date(mockTimestamp).toISOString())
    })
  })

  test('each record has unique UUID', async () => {
    await saveHoldEvent(event)

    const records = mockDb.builder.insert.mock.calls[0][0]
    const ids = records.map((r) => r.id)
    const uniqueIds = [...new Set(ids)]
    expect(uniqueIds).toHaveLength(records.length)
  })

  test('passes event object to all createRow calls', async () => {
    await saveHoldEvent(event)

    mockCreateRow.mock.calls.forEach((call) => {
      expect(call[3]).toBe(event)
    })
  })

  test('uses correct categories for each row', async () => {
    await saveHoldEvent(event)

    const records = mockDb.builder.insert.mock.calls[0][0]
    expect(records[0].category).toBe(FRN)
    expect(records[1].category).toBe(SCHEME_ID)
    expect(records[2].category).toBe(SCHEME_ID)
  })

  test('preserves all event properties in records', async () => {
    await saveHoldEvent(event)

    const records = mockDb.builder.insert.mock.calls[0][0]
    records.forEach((record) => {
      expect(record.source).toBe(event.source)
      expect(record).not.toHaveProperty('subject')
      expect(record.time).toBe(new Date(event.time).toISOString())
      expect(record.type).toBe(event.type)
      expect(record.data).toBe(JSON.stringify(event.data))
    })
  })
})

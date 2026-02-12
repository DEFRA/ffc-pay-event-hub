const { v4: uuidv4 } = require('uuid')
const { FRN, SCHEME_ID } = require('../../../../app/constants/categories')

jest.mock('uuid')
const mockUuids = ['uuid-1', 'uuid-2', 'uuid-3']
let uuidCallCount = 0
uuidv4.mockImplementation(() => {
  const uuid = mockUuids[uuidCallCount]
  uuidCallCount++
  return uuid
})

jest.mock('../../../../app/data')
const db = require('../../../../app/data')
const mockBulkCreate = jest.fn()
db.holds = {
  bulkCreate: mockBulkCreate,
}

jest.mock('../../../../app/inbound/save-event/create-row')
const {
  createRow: mockCreateRow,
} = require('../../../../app/inbound/save-event/create-row')
mockCreateRow.mockImplementation((partitionKey, rowKey, category, event) => ({
  partitionKey,
  rowKey,
  category,
  source: event.source,
  subject: event.subject,
  time: event.time,
  type: event.type,
  data: JSON.stringify(event.data),
}))

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp,
} = require('../../../../app/inbound/save-event/get-timestamp')
const mockTimestamp = 9988776655
mockGetTimestamp.mockReturnValue(mockTimestamp)

const { saveHoldEvent } = require('../../../../app/inbound/save-event/hold')
const event = require('../../../mocks/events/hold')

describe('save hold event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    expect(uuidv4).toHaveBeenCalledTimes(3)
  })

  test('calls bulkCreate once', async () => {
    await saveHoldEvent(event)
    expect(mockBulkCreate).toHaveBeenCalledTimes(1)
  })

  test('creates records with correct structure', async () => {
    const holdEvent = {
      ...event,
      data: {
        ...event.data,
        frn: '9876543210',
        schemeId: 'scheme-789',
        holdCategoryId: 'hold-cat-123',
      },
    }
    await saveHoldEvent(holdEvent)

    const records = mockBulkCreate.mock.calls[0][0]
    expect(records).toHaveLength(3)

    expect(records[0]).toEqual({
      id: mockUuids[0],
      partitionKey: '9876543210',
      rowKey: 'scheme-789',
      timestamp: mockTimestamp,
      category: FRN,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(holdEvent.data),
    })

    expect(records[1]).toEqual({
      id: mockUuids[1],
      partitionKey: 'scheme-789',
      rowKey: '9876543210',
      timestamp: mockTimestamp,
      category: SCHEME_ID,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(holdEvent.data),
    })

    expect(records[2]).toEqual({
      id: mockUuids[2],
      partitionKey: 'hold-cat-123',
      rowKey: '9876543210',
      timestamp: mockTimestamp,
      category: SCHEME_ID,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(holdEvent.data),
    })
  })

  test('all records have same timestamp', async () => {
    await saveHoldEvent(event)

    const records = mockBulkCreate.mock.calls[0][0]
    records.forEach((record) => {
      expect(record.timestamp).toBe(mockTimestamp)
    })
  })

  test('each record has unique UUID', async () => {
    await saveHoldEvent(event)

    const records = mockBulkCreate.mock.calls[0][0]
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

    const records = mockBulkCreate.mock.calls[0][0]
    expect(records[0].category).toBe(FRN)
    expect(records[1].category).toBe(SCHEME_ID)
    expect(records[2].category).toBe(SCHEME_ID)
  })

  test('preserves all event properties in records', async () => {
    await saveHoldEvent(event)

    const records = mockBulkCreate.mock.calls[0][0]
    records.forEach((record) => {
      expect(record.source).toBe(event.source)
      expect(record.subject).toBe(event.subject)
      expect(record.time).toBe(event.time)
      expect(record.type).toBe(event.type)
      expect(record.data).toBe(JSON.stringify(event.data))
    })
  })
})

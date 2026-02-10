const { v4: uuidv4 } = require('uuid')
const {
  FRN,
  CORRELATION_ID,
  SCHEME_ID,
  BATCH,
} = require('../../../../app/constants/categories')

jest.mock('uuid')
const mockUuids = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4']
let uuidCallCount = 0
uuidv4.mockImplementation(() => {
  const uuid = mockUuids[uuidCallCount]
  uuidCallCount++
  return uuid
})

jest.mock('../../../../app/data')
const db = require('../../../../app/data')
const mockBulkCreate = jest.fn()
db.payments = {
  bulkCreate: mockBulkCreate,
}

jest.mock('../../../../app/inbound/save-event/create-row')
const {
  createRow: mockCreateRow,
} = require('../../../../app/inbound/save-event/create-row')

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp,
} = require('../../../../app/inbound/save-event/get-timestamp')
const mockTimestamp = 1122334455
mockGetTimestamp.mockReturnValue(mockTimestamp)

const {
  savePaymentEvent,
} = require('../../../../app/inbound/save-event/payment')
const event = require('../../../mocks/events/payment')

describe('save payment event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    uuidCallCount = 0

    // Reset the mock implementation for each test
    mockCreateRow.mockImplementation(
      (partitionKey, rowKey, category, event) => ({
        partitionKey,
        rowKey,
        category,
        source: event.source,
        subject: event.subject,
        time: event.time,
        type: event.type,
        data: JSON.stringify(event.data),
      })
    )
  })

  test('calls getTimestamp with event time', async () => {
    await savePaymentEvent(event)
    expect(mockGetTimestamp).toHaveBeenCalledWith(event.time)
  })

  test('creates row with FRN partition key', async () => {
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(
      event.data.frn,
      `${event.data.correlationId}|${event.data.invoiceNumber}`,
      FRN,
      event
    )
  })

  test('creates row with CORRELATION_ID partition key', async () => {
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(
      event.data.correlationId,
      `${event.data.frn}|${event.data.invoiceNumber}`,
      CORRELATION_ID,
      event
    )
  })

  test('creates row with SCHEME_ID partition key', async () => {
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(
      event.data.schemeId,
      `${event.data.frn}|${event.data.invoiceNumber}`,
      SCHEME_ID,
      event
    )
  })

  test('creates 3 rows when no batch', async () => {
    const eventWithoutBatch = {
      ...event,
      data: {
        ...event.data,
        batch: undefined,
      },
    }
    await savePaymentEvent(eventWithoutBatch)
    expect(mockCreateRow).toHaveBeenCalledTimes(3)
  })

  test('creates 4 rows when batch is present', async () => {
    const eventWithBatch = {
      ...event,
      data: {
        ...event.data,
        batch: 'batch-123',
      },
    }
    await savePaymentEvent(eventWithBatch)
    expect(mockCreateRow).toHaveBeenCalledTimes(4)
  })

  test('creates row with BATCH partition key when batch is present', async () => {
    const eventWithBatch = {
      ...event,
      data: {
        ...event.data,
        batch: 'batch-456',
      },
    }
    await savePaymentEvent(eventWithBatch)
    expect(mockCreateRow).toHaveBeenCalledWith(
      'batch-456',
      `${event.data.frn}|${event.data.invoiceNumber}`,
      BATCH,
      eventWithBatch
    )
  })

  test('does not create BATCH row when batch is null', async () => {
    const eventWithoutBatch = {
      ...event,
      data: {
        ...event.data,
        batch: null,
      },
    }
    await savePaymentEvent(eventWithoutBatch)
    const batchCalls = mockCreateRow.mock.calls.filter(
      (call) => call[2] === BATCH
    )
    expect(batchCalls).toHaveLength(0)
  })

  test('generates UUID for each record', async () => {
    const eventWithBatch = {
      ...event,
      data: {
        ...event.data,
        batch: 'batch-789',
      },
    }
    await savePaymentEvent(eventWithBatch)
    expect(uuidv4).toHaveBeenCalledTimes(4)
  })

  test('calls bulkCreate once', async () => {
    await savePaymentEvent(event)
    expect(mockBulkCreate).toHaveBeenCalledTimes(1)
  })

  test('creates records with correct structure without batch', async () => {
    const eventWithoutBatch = {
      ...event,
      data: {
        frn: '1234567890',
        correlationId: 'corr-123',
        invoiceNumber: 'INV-001',
        schemeId: 'scheme-456',
        batch: undefined,
      },
    }
    await savePaymentEvent(eventWithoutBatch)

    const records = mockBulkCreate.mock.calls[0][0]
    expect(records).toHaveLength(3)

    expect(records[0]).toEqual({
      id: mockUuids[0],
      partitionKey: '1234567890',
      rowKey: 'corr-123|INV-001',
      timestamp: mockTimestamp,
      category: FRN,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(eventWithoutBatch.data),
    })

    expect(records[1]).toEqual({
      id: mockUuids[1],
      partitionKey: 'corr-123',
      rowKey: '1234567890|INV-001',
      timestamp: mockTimestamp,
      category: CORRELATION_ID,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(eventWithoutBatch.data),
    })

    expect(records[2]).toEqual({
      id: mockUuids[2],
      partitionKey: 'scheme-456',
      rowKey: '1234567890|INV-001',
      timestamp: mockTimestamp,
      category: SCHEME_ID,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(eventWithoutBatch.data),
    })
  })

  test('creates records with correct structure with batch', async () => {
    const eventWithBatch = {
      ...event,
      data: {
        frn: '1234567890',
        correlationId: 'corr-123',
        invoiceNumber: 'INV-001',
        schemeId: 'scheme-456',
        batch: 'batch-999',
      },
    }
    await savePaymentEvent(eventWithBatch)

    const records = mockBulkCreate.mock.calls[0][0]
    expect(records).toHaveLength(4)

    expect(records[3]).toEqual({
      id: mockUuids[3],
      partitionKey: 'batch-999',
      rowKey: '1234567890|INV-001',
      timestamp: mockTimestamp,
      category: BATCH,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(eventWithBatch.data),
    })
  })

  test('all records have same timestamp', async () => {
    const eventWithBatch = {
      ...event,
      data: {
        ...event.data,
        batch: 'batch-111',
      },
    }
    await savePaymentEvent(eventWithBatch)

    const records = mockBulkCreate.mock.calls[0][0]
    records.forEach((record) => {
      expect(record.timestamp).toBe(mockTimestamp)
    })
  })

  test('each record has unique UUID', async () => {
    const eventWithBatch = {
      ...event,
      data: {
        ...event.data,
        batch: 'batch-222',
      },
    }
    await savePaymentEvent(eventWithBatch)

    const records = mockBulkCreate.mock.calls[0][0]
    const ids = records.map((r) => r.id)
    const uniqueIds = [...new Set(ids)]
    expect(uniqueIds).toHaveLength(records.length)
  })
})

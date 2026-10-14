const { randomUUID } = require('node:crypto')
const { WARNING } = require('../../../../app/constants/categories')

jest.mock('node:crypto', () => ({ randomUUID: jest.fn() }))
const mockUuid = 'test-uuid-5678'
randomUUID.mockReturnValue(mockUuid)

const { createKnexMock } = require('../../../helpers/mock-knex')
const mockDb = createKnexMock(['warnings'])
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
const mockRow = {
  partitionKey: 'test-partition-key',
  rowKey: 'test-row-key',
  category: WARNING,
  source: 'test-source',
  subject: 'test-subject',
  time: '2024-01-01T10:00:00.000Z',
  type: 'test-type',
  data: { message: 'test-data' }
}
mockCreateRow.mockReturnValue(mockRow)

jest.mock('../../../../app/inbound/save-event/get-warning-type')
const {
  getWarningType: mockGetWarningType
} = require('../../../../app/inbound/save-event/get-warning-type')
const mockWarningType = 'warning-type-123'
mockGetWarningType.mockReturnValue(mockWarningType)

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp
} = require('../../../../app/inbound/save-event/get-timestamp')
const mockTimestamp = 9876543210
mockGetTimestamp.mockReturnValue(mockTimestamp)

const {
  saveWarningEvent
} = require('../../../../app/inbound/save-event/warning')
const event = require('../../../mocks/events/warning')

describe('save warning event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('calls getTimestamp with event time', async () => {
    await saveWarningEvent(event)
    expect(mockGetTimestamp).toHaveBeenCalledWith(event.time)
  })

  test('calls getWarningType with event type', async () => {
    await saveWarningEvent(event)
    expect(mockGetWarningType).toHaveBeenCalledWith(event.type)
  })

  test('calls createRow with correct parameters', async () => {
    await saveWarningEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(
      mockWarningType,
      event.id,
      WARNING,
      event
    )
  })

  test('generates a UUID for the warning record', async () => {
    await saveWarningEvent(event)
    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  test('creates one warning record in the warnings table', async () => {
    await saveWarningEvent(event)
    expect(mockDb.tables.warnings).toHaveBeenCalledWith()
    expect(mockDb.builder.insert).toHaveBeenCalledTimes(1)
  })

  test('propagates a database failure', async () => {
    mockDb.builder.rejects(new Error('DB error'))
    await expect(saveWarningEvent(event)).rejects.toThrow('DB error')
  })

  test('creates warning record with correct structure', async () => {
    await saveWarningEvent(event)
    expect(mockDb.builder.insert).toHaveBeenCalledWith({
      id: mockUuid,
      partitionKey: mockRow.partitionKey,
      rowKey: mockRow.rowKey,
      timestamp: new Date(mockTimestamp).toISOString(),
      category: mockRow.category,
      source: mockRow.source,
      subject: mockRow.subject,
      time: new Date(mockRow.time).toISOString(),
      type: mockRow.type,
      data: JSON.stringify(mockRow.data)
    })
  })

  test('uses row partition key from createRow', async () => {
    await saveWarningEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.partitionKey).toBe(mockRow.partitionKey)
  })

  test('uses row key from createRow', async () => {
    await saveWarningEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.rowKey).toBe(mockRow.rowKey)
  })

  test('uses timestamp for timestamp field', async () => {
    await saveWarningEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.timestamp).toBe(new Date(mockTimestamp).toISOString())
  })

  test('uses category from createRow', async () => {
    await saveWarningEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.category).toBe(mockRow.category)
  })

  test('preserves all row properties in record', async () => {
    await saveWarningEvent(event)
    const callArg = mockDb.builder.insert.mock.calls[0][0]
    expect(callArg.source).toBe(mockRow.source)
    expect(callArg.subject).toBe(mockRow.subject)
    expect(callArg.time).toBe(new Date(mockRow.time).toISOString())
    expect(callArg.type).toBe(mockRow.type)
    expect(callArg.data).toBe(JSON.stringify(mockRow.data))
  })
})

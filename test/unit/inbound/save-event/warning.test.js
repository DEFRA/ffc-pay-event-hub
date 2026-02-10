const { v4: uuidv4 } = require('uuid')
const { WARNING } = require('../../../../app/constants/categories')

jest.mock('uuid')
const mockUuid = 'test-uuid-5678'
uuidv4.mockReturnValue(mockUuid)

jest.mock('../../../../app/data')
const db = require('../../../../app/data')
const mockCreate = jest.fn()
db.warnings = {
  create: mockCreate,
}

jest.mock('../../../../app/inbound/save-event/create-row')
const {
  createRow: mockCreateRow,
} = require('../../../../app/inbound/save-event/create-row')
const mockRow = {
  partitionKey: 'test-partition-key',
  rowKey: 'test-row-key',
  category: WARNING,
  source: 'test-source',
  subject: 'test-subject',
  time: 'test-time',
  type: 'test-type',
  data: 'test-data',
}
mockCreateRow.mockReturnValue(mockRow)

jest.mock('../../../../app/inbound/save-event/get-warning-type')
const {
  getWarningType: mockGetWarningType,
} = require('../../../../app/inbound/save-event/get-warning-type')
const mockWarningType = 'warning-type-123'
mockGetWarningType.mockReturnValue(mockWarningType)

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp,
} = require('../../../../app/inbound/save-event/get-timestamp')
const mockTimestamp = 9876543210
mockGetTimestamp.mockReturnValue(mockTimestamp)

const {
  saveWarningEvent,
} = require('../../../../app/inbound/save-event/warning')
const event = require('../../../mocks/events/warning')

describe('save warning event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('creates one warning record', async () => {
    await saveWarningEvent(event)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  test('creates warning record with correct structure', async () => {
    await saveWarningEvent(event)
    expect(mockCreate).toHaveBeenCalledWith({
      id: mockUuid,
      partitionKey: mockRow.partitionKey,
      rowKey: mockRow.rowKey,
      timestamp: mockTimestamp,
      category: mockRow.category,
      source: mockRow.source,
      subject: mockRow.subject,
      time: mockRow.time,
      type: mockRow.type,
      data: mockRow.data,
    })
  })

  test('uses row partition key from createRow', async () => {
    await saveWarningEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.partitionKey).toBe(mockRow.partitionKey)
  })

  test('uses row key from createRow', async () => {
    await saveWarningEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.rowKey).toBe(mockRow.rowKey)
  })

  test('uses timestamp for timestamp field', async () => {
    await saveWarningEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.timestamp).toBe(mockTimestamp)
  })

  test('uses category from createRow', async () => {
    await saveWarningEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.category).toBe(mockRow.category)
  })

  test('preserves all row properties in record', async () => {
    await saveWarningEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.source).toBe(mockRow.source)
    expect(callArg.subject).toBe(mockRow.subject)
    expect(callArg.time).toBe(mockRow.time)
    expect(callArg.type).toBe(mockRow.type)
    expect(callArg.data).toBe(mockRow.data)
  })
})

const { v4: uuidv4 } = require('uuid')
const { BATCH } = require('../../../../app/constants/categories')

jest.mock('uuid')
const mockUuid = 'test-uuid-1234'
uuidv4.mockReturnValue(mockUuid)

jest.mock('../../../../app/data')
const db = require('../../../../app/data')
const mockCreate = jest.fn()
db.batches = {
  create: mockCreate,
}

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp,
} = require('../../../../app/inbound/save-event/get-timestamp')
const mockTimestamp = 1234567890
mockGetTimestamp.mockReturnValue(mockTimestamp)

const { saveBatchEvent } = require('../../../../app/inbound/save-event/batch')
const event = require('../../../mocks/events/batch')

describe('save batch event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls getTimestamp with event time', async () => {
    await saveBatchEvent(event)
    expect(mockGetTimestamp).toHaveBeenCalledWith(event.time)
  })

  test('generates a UUID for the batch record', async () => {
    await saveBatchEvent(event)
    expect(uuidv4).toHaveBeenCalledTimes(1)
  })

  test('creates one batch record', async () => {
    await saveBatchEvent(event)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })

  test('creates batch record with correct structure', async () => {
    await saveBatchEvent(event)
    expect(mockCreate).toHaveBeenCalledWith({
      id: mockUuid,
      partitionKey: event.data.filename,
      timestamp: mockTimestamp,
      rowKey: mockTimestamp.toString(),
      category: BATCH,
      source: event.source,
      subject: event.subject,
      time: event.time,
      type: event.type,
      data: JSON.stringify(event.data),
    })
  })

  test('uses filename as partition key', async () => {
    await saveBatchEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.partitionKey).toBe(event.data.filename)
  })

  test('uses timestamp as rowKey', async () => {
    await saveBatchEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.rowKey).toBe(mockTimestamp.toString())
  })

  test('stringifies event data', async () => {
    await saveBatchEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.data).toBe(JSON.stringify(event.data))
  })

  test('sets category to BATCH', async () => {
    await saveBatchEvent(event)
    const callArg = mockCreate.mock.calls[0][0]
    expect(callArg.category).toBe(BATCH)
  })
})

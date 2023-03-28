jest.mock('../../../../app/inbound/save-event/get-timestamp')
const { getTimestamp: mockGetTimestamp } = require('../../../../app/inbound/save-event/get-timestamp')

const mockTimestamp = 1234567890
mockGetTimestamp.mockReturnValue(mockTimestamp)

const { createRow } = require('../../../../app/inbound/save-event/create-row')

let mockPartitionKey
let mockRowKey
let mockCategory
let mockEvent

describe('create row', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPartitionKey = 'mock-partition-key'
    mockRowKey = 'mock-row-key'
    mockCategory = 'mock-category'
    mockEvent = {
      time: 'mock-time',
      data: {
        filename: 'mock-filename'
      }
    }
  })

  test('creates entity with partition key', async () => {
    const entity = await createRow(mockPartitionKey, mockRowKey, mockCategory, mockEvent)
    expect(entity.partitionKey).toBe(mockPartitionKey)
  })

  test('creates entity with partition key if key number', async () => {
    mockPartitionKey = 123
    const entity = await createRow(mockPartitionKey, mockRowKey, mockCategory, mockEvent)
    expect(entity.partitionKey).toBe(mockPartitionKey.toString())
  })

  test('creates entity with row key', async () => {
    const entity = await createRow(mockPartitionKey, mockRowKey, mockCategory, mockEvent)
    expect(entity.rowKey).toBe(`${mockRowKey}|${mockTimestamp}`)
  })

  test('creates entity with category', async () => {
    const entity = await createRow(mockPartitionKey, mockRowKey, mockCategory, mockEvent)
    expect(entity.category).toBe(mockCategory)
  })

  test('creates entity with event properties', async () => {
    const entity = await createRow(mockPartitionKey, mockRowKey, mockCategory, mockEvent)
    expect(entity.time).toBe(mockEvent.time)
  })

  test('creates entity with event data as string', async () => {
    const entity = await createRow(mockPartitionKey, mockRowKey, mockCategory, mockEvent)
    expect(entity.data).toBe(JSON.stringify(mockEvent.data))
  })

  test('creates entity with event data as undefined if data is null', async () => {
    mockEvent.data = null
    const entity = await createRow(mockPartitionKey, mockRowKey, mockCategory, mockEvent)
    expect(entity.data).toBeUndefined()
  })
})

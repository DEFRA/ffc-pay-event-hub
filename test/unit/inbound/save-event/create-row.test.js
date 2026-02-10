jest.mock('../../../../app/inbound/save-event/get-timestamp')
const {
  getTimestamp: mockGetTimestamp,
} = require('../../../../app/inbound/save-event/get-timestamp')

const mockTimestamp = 1234567890
mockGetTimestamp.mockReturnValue(mockTimestamp)

const { createRow } = require('../../../../app/inbound/save-event/create-row')

describe('create row', () => {
  let mockPartitionKey
  let mockRowKey
  let mockCategory
  let mockEvent

  beforeEach(() => {
    jest.clearAllMocks()
    mockPartitionKey = 'mock-partition-key'
    mockRowKey = 'mock-row-key'
    mockCategory = 'mock-category'
    mockEvent = { time: 'mock-time', data: { filename: 'mock-filename' } }
  })

  test.each([
    ['partitionKey', () => mockPartitionKey, (pk) => pk.toString()],
    ['rowKey', () => `${mockRowKey}|${mockTimestamp}`, (v) => v],
    ['category', () => mockCategory, (v) => v],
    ['time', () => mockEvent.time, (v) => v],
    ['data', () => JSON.stringify(mockEvent.data), (v) => v],
  ])('creates entity with %s', async (_, valueFn, expectedFn) => {
    const entity = await createRow(
      mockPartitionKey,
      mockRowKey,
      mockCategory,
      mockEvent
    )
    expect(entity[_]).toBe(expectedFn(valueFn()))
  })

  test('partitionKey is string if number', async () => {
    mockPartitionKey = 123
    const entity = await createRow(
      mockPartitionKey,
      mockRowKey,
      mockCategory,
      mockEvent
    )
    expect(entity.partitionKey).toBe('123')
  })

  test('data is undefined if event data is null', async () => {
    mockEvent.data = null
    const entity = await createRow(
      mockPartitionKey,
      mockRowKey,
      mockCategory,
      mockEvent
    )
    expect(entity.data).toBeUndefined()
  })
})

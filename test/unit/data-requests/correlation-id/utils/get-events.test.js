const { createKnexMock } = require('../../../../helpers/mock-knex')

const mockDb = createKnexMock(['payments'])

jest.mock('../../../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { PARTITION_KEY } = require('../../../../mocks/values/partition-key')
const { CATEGORY } = require('../../../../mocks/values/category')
const {
  getEvents
} = require('../../../../../app/data-requests/correlation-id/utils/get-events')

let extractedEvent, enrichedEvent, mockDbEvents

describe('get events', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    extractedEvent = structuredClone(
      require('../../../../mocks/events/extracted')
    )
    enrichedEvent = structuredClone(
      require('../../../../mocks/events/enriched')
    )

    mockDbEvents = [
      {
        id: 'uuid-1',
        partitionKey: PARTITION_KEY,
        category: CATEGORY,
        timestamp: 1234567890,
        source: extractedEvent.source,
        subject: extractedEvent.subject,
        time: extractedEvent.time,
        type: extractedEvent.type,
        data: extractedEvent.data
      },
      {
        id: 'uuid-2',
        partitionKey: PARTITION_KEY,
        category: CATEGORY,
        timestamp: 1234567891,
        source: enrichedEvent.source,
        subject: enrichedEvent.subject,
        time: enrichedEvent.time,
        type: enrichedEvent.type,
        data: enrichedEvent.data
      }
    ]

    mockDb.builder.resolves(mockDbEvents)
  })

  test('should query the payments table with correct where clause', async () => {
    await getEvents(PARTITION_KEY, CATEGORY)
    expect(mockDb.tables.payments).toHaveBeenCalledTimes(1)
    expect(mockDb.tables.payments).toHaveBeenCalledWith()
    expect(mockDb.builder.where).toHaveBeenCalledWith({
      partitionKey: PARTITION_KEY,
      category: CATEGORY
    })
  })

  test('should order results by timestamp ascending', async () => {
    await getEvents(PARTITION_KEY, CATEGORY)
    expect(mockDb.builder.orderBy).toHaveBeenCalledWith('timestamp', 'asc')
  })

  test('should return all events and parse data from JSON', async () => {
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result).toHaveLength(mockDbEvents.length)
    expect(result[0].data).toEqual(extractedEvent.data)
    expect(result[1].data).toEqual(enrichedEvent.data)
  })

  test('should return new objects rather than the database rows', async () => {
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result[0]).not.toBe(mockDbEvents[0])
    expect(result[1]).not.toBe(mockDbEvents[1])
  })

  test('should propagate a database failure', async () => {
    mockDb.builder.rejects(new Error('DB error'))
    await expect(getEvents(PARTITION_KEY, CATEGORY)).rejects.toThrow('DB error')
  })

  test('should return an empty array if no events', async () => {
    mockDb.builder.resolves([])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result).toHaveLength(0)
  })

  test('should handle events with undefined data', async () => {
    const eventWithNoData = {
      id: 'uuid-3',
      partitionKey: PARTITION_KEY,
      category: CATEGORY,
      timestamp: 1234567892,
      source: 'test-source',
      subject: 'test-subject',
      time: 'test-time',
      type: 'test-type',
      data: null
    }

    mockDb.builder.resolves([eventWithNoData])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result[0].data).toBeNull()
  })

  test('should handle events with empty string data', async () => {
    const eventWithEmptyData = {
      id: 'uuid-4',
      partitionKey: PARTITION_KEY,
      category: CATEGORY,
      timestamp: 1234567893,
      source: 'test-source',
      subject: 'test-subject',
      time: 'test-time',
      type: 'test-type',
      data: ''
    }

    mockDb.builder.resolves([eventWithEmptyData])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result[0].data).toBeNull()
  })

  test('should preserve all event properties', async () => {
    const result = await getEvents(PARTITION_KEY, CATEGORY)

    expect(result[0]).toMatchObject({
      id: mockDbEvents[0].id,
      partitionKey: mockDbEvents[0].partitionKey,
      category: mockDbEvents[0].category,
      timestamp: mockDbEvents[0].timestamp,
      source: mockDbEvents[0].source,
      subject: mockDbEvents[0].subject,
      time: mockDbEvents[0].time,
      type: mockDbEvents[0].type
    })

    expect(result[1]).toMatchObject({
      id: mockDbEvents[1].id,
      partitionKey: mockDbEvents[1].partitionKey,
      category: mockDbEvents[1].category,
      timestamp: mockDbEvents[1].timestamp,
      source: mockDbEvents[1].source,
      subject: mockDbEvents[1].subject,
      time: mockDbEvents[1].time,
      type: mockDbEvents[1].type
    })
  })

  test('should parse complex nested JSON data', async () => {
    const complexData = {
      nested: {
        property: 'value',
        array: [1, 2, 3]
      }
    }

    const eventWithComplexData = {
      id: 'uuid-5',
      partitionKey: PARTITION_KEY,
      category: CATEGORY,
      timestamp: 1234567894,
      source: 'test-source',
      subject: 'test-subject',
      time: 'test-time',
      type: 'test-type',
      data: complexData
    }

    mockDb.builder.resolves([eventWithComplexData])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result[0].data).toEqual(complexData)
  })

  test('should parse stringified JSON data', async () => {
    const stringifiedData = JSON.stringify({
      foo: 'bar',
      nested: { value: 42 }
    })

    const eventWithStringData = {
      id: 'uuid-6',
      partitionKey: PARTITION_KEY,
      category: CATEGORY,
      timestamp: 1234567895,
      source: 'test-source',
      subject: 'test-subject',
      time: 'test-time',
      type: 'test-type',
      data: stringifiedData
    }

    mockDb.builder.resolves([eventWithStringData])

    const result = await getEvents(PARTITION_KEY, CATEGORY)

    expect(result[0].data).toEqual({
      foo: 'bar',
      nested: { value: 42 }
    })
  })
})

jest.mock('../../../../app/data')
const db = require('../../../../app/data')

const mockFindAll = jest.fn()
db.payments = {
  findAll: mockFindAll,
}

const { PARTITION_KEY } = require('../../../mocks/values/partition-key')
const { CATEGORY } = require('../../../mocks/values/category')
const { getEvents } = require('../../../../app/outbound/events/get-events')

let extractedEvent, enrichedEvent, mockDbEvents

describe('get events', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    extractedEvent = structuredClone(
      require('../../../mocks/events/extracted')
    )
    enrichedEvent = structuredClone(require('../../../mocks/events/enriched'))

    // Mock database events with toJSON method
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
        data: JSON.stringify(extractedEvent.data),
        toJSON: function () {
          return {
            id: this.id,
            partitionKey: this.partitionKey,
            category: this.category,
            timestamp: this.timestamp,
            source: this.source,
            subject: this.subject,
            time: this.time,
            type: this.type,
            data: this.data,
          }
        },
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
        data: JSON.stringify(enrichedEvent.data),
        toJSON: function () {
          return {
            id: this.id,
            partitionKey: this.partitionKey,
            category: this.category,
            timestamp: this.timestamp,
            source: this.source,
            subject: this.subject,
            time: this.time,
            type: this.type,
            data: this.data,
          }
        },
      },
    ]

    mockFindAll.mockResolvedValue(mockDbEvents)
  })

  test('should query database with correct where clause', async () => {
    await getEvents(PARTITION_KEY, CATEGORY)
    expect(mockFindAll).toHaveBeenCalledTimes(1)
    expect(mockFindAll).toHaveBeenCalledWith({
      where: {
        partitionKey: PARTITION_KEY,
        category: CATEGORY,
      },
      order: [['timestamp', 'ASC']],
    })
  })

  test('should order results by timestamp ascending', async () => {
    await getEvents(PARTITION_KEY, CATEGORY)
    const callArgs = mockFindAll.mock.calls[0][0]
    expect(callArgs.order).toEqual([['timestamp', 'ASC']])
  })

  test('should return all events and parse data from JSON', async () => {
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result).toHaveLength(mockDbEvents.length)
    expect(result[0].data).toEqual(extractedEvent.data)
    expect(result[1].data).toEqual(enrichedEvent.data)
  })

  test('should call toJSON on each event', async () => {
    const toJSONSpy1 = jest.spyOn(mockDbEvents[0], 'toJSON')
    const toJSONSpy2 = jest.spyOn(mockDbEvents[1], 'toJSON')

    await getEvents(PARTITION_KEY, CATEGORY)

    expect(toJSONSpy1).toHaveBeenCalledTimes(1)
    expect(toJSONSpy2).toHaveBeenCalledTimes(1)
  })

  test('should return an empty array if no events', async () => {
    mockFindAll.mockResolvedValue([])
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
      data: null,
      toJSON: function () {
        return {
          id: this.id,
          partitionKey: this.partitionKey,
          category: this.category,
          timestamp: this.timestamp,
          source: this.source,
          subject: this.subject,
          time: this.time,
          type: this.type,
          data: this.data,
        }
      },
    }

    mockFindAll.mockResolvedValue([eventWithNoData])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result[0].data).toBeUndefined()
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
      data: '',
      toJSON: function () {
        return {
          id: this.id,
          partitionKey: this.partitionKey,
          category: this.category,
          timestamp: this.timestamp,
          source: this.source,
          subject: this.subject,
          time: this.time,
          type: this.type,
          data: this.data,
        }
      },
    }

    mockFindAll.mockResolvedValue([eventWithEmptyData])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result[0].data).toBeUndefined()
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
      type: mockDbEvents[0].type,
    })

    expect(result[1]).toMatchObject({
      id: mockDbEvents[1].id,
      partitionKey: mockDbEvents[1].partitionKey,
      category: mockDbEvents[1].category,
      timestamp: mockDbEvents[1].timestamp,
      source: mockDbEvents[1].source,
      subject: mockDbEvents[1].subject,
      time: mockDbEvents[1].time,
      type: mockDbEvents[1].type,
    })
  })

  test('should parse complex nested JSON data', async () => {
    const complexData = {
      nested: {
        property: 'value',
        array: [1, 2, 3],
      },
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
      data: JSON.stringify(complexData),
      toJSON: function () {
        return {
          id: this.id,
          partitionKey: this.partitionKey,
          category: this.category,
          timestamp: this.timestamp,
          source: this.source,
          subject: this.subject,
          time: this.time,
          type: this.type,
          data: this.data,
        }
      },
    }

    mockFindAll.mockResolvedValue([eventWithComplexData])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result[0].data).toEqual(complexData)
  })
})

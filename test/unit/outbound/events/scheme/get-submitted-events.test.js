jest.mock('../../../../../app/data')
const { db } = require('../../../../../app/data')

const mockFindAll = jest.fn()
db.payments = {
  findAll: mockFindAll,
}

const { PARTITION_KEY } = require('../../../../mocks/values/partition-key')
const { PAYMENT_SUBMITTED } = require('../../../../../app/constants/events')
const {
  getSubmittedEvents,
} = require('../../../../../app/outbound/events/scheme-id/get-submitted-events')

const category = 'schemeId'

let extractedEvent, enrichedEvent, mockDbEvents

describe('getSubmittedEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    extractedEvent = JSON.parse(
      JSON.stringify(require('../../../../mocks/events/extracted'))
    )
    enrichedEvent = JSON.parse(
      JSON.stringify(require('../../../../mocks/events/enriched'))
    )

    // Mock database events with toJSON method
    mockDbEvents = [
      {
        id: 'uuid-1',
        PartitionKey: PARTITION_KEY,
        category,
        type: PAYMENT_SUBMITTED,
        Timestamp: 1234567890,
        source: extractedEvent.source,
        subject: extractedEvent.subject,
        time: extractedEvent.time,
        data: JSON.stringify(extractedEvent.data),
        toJSON: function () {
          return {
            id: this.id,
            PartitionKey: this.PartitionKey,
            category: this.category,
            type: this.type,
            Timestamp: this.Timestamp,
            source: this.source,
            subject: this.subject,
            time: this.time,
            data: this.data,
          }
        },
      },
      {
        id: 'uuid-2',
        PartitionKey: PARTITION_KEY,
        category,
        type: PAYMENT_SUBMITTED,
        Timestamp: 1234567891,
        source: enrichedEvent.source,
        subject: enrichedEvent.subject,
        time: enrichedEvent.time,
        data: JSON.stringify(enrichedEvent.data),
        toJSON: function () {
          return {
            id: this.id,
            PartitionKey: this.PartitionKey,
            category: this.category,
            type: this.type,
            Timestamp: this.Timestamp,
            source: this.source,
            subject: this.subject,
            time: this.time,
            data: this.data,
          }
        },
      },
    ]

    mockFindAll.mockResolvedValue(mockDbEvents)
  })

  test('should query database with category and type filters when no id provided', async () => {
    await getSubmittedEvents(undefined, category)
    expect(mockFindAll).toHaveBeenCalledTimes(1)
    expect(mockFindAll).toHaveBeenCalledWith({
      where: {
        category,
        type: PAYMENT_SUBMITTED,
      },
      order: [['Timestamp', 'ASC']],
    })
  })

  test('should query database with PartitionKey, category and type filters when id provided', async () => {
    await getSubmittedEvents(PARTITION_KEY, category)
    expect(mockFindAll).toHaveBeenCalledTimes(1)
    expect(mockFindAll).toHaveBeenCalledWith({
      where: {
        PartitionKey: PARTITION_KEY,
        category,
        type: PAYMENT_SUBMITTED,
      },
      order: [['Timestamp', 'ASC']],
    })
  })

  test('should order results by Timestamp ascending', async () => {
    await getSubmittedEvents(PARTITION_KEY, category)
    const callArgs = mockFindAll.mock.calls[0][0]
    expect(callArgs.order).toEqual([['Timestamp', 'ASC']])
  })

  test('should return all events with data parsed as JSON', async () => {
    const result = await getSubmittedEvents(PARTITION_KEY, category)
    expect(result).toHaveLength(2)
    expect(result[0].data).toEqual(extractedEvent.data)
    expect(result[1].data).toEqual(enrichedEvent.data)
  })

  test('should call toJSON on each event', async () => {
    const toJSONSpy1 = jest.spyOn(mockDbEvents[0], 'toJSON')
    const toJSONSpy2 = jest.spyOn(mockDbEvents[1], 'toJSON')

    await getSubmittedEvents(PARTITION_KEY, category)

    expect(toJSONSpy1).toHaveBeenCalledTimes(1)
    expect(toJSONSpy2).toHaveBeenCalledTimes(1)
  })

  test('should return empty array when no events', async () => {
    mockFindAll.mockResolvedValue([])
    const result = await getSubmittedEvents(PARTITION_KEY, category)
    expect(result).toEqual([])
  })

  test('should handle events with undefined data', async () => {
    const eventWithNoData = {
      id: 'uuid-3',
      PartitionKey: PARTITION_KEY,
      category,
      type: PAYMENT_SUBMITTED,
      Timestamp: 1234567892,
      source: 'test-source',
      subject: 'test-subject',
      time: 'test-time',
      data: null,
      toJSON: function () {
        return {
          id: this.id,
          PartitionKey: this.PartitionKey,
          category: this.category,
          type: this.type,
          Timestamp: this.Timestamp,
          source: this.source,
          subject: this.subject,
          time: this.time,
          data: this.data,
        }
      },
    }

    mockFindAll.mockResolvedValue([eventWithNoData])
    const result = await getSubmittedEvents(PARTITION_KEY, category)
    expect(result[0].data).toBeNull()
  })

  test('should handle events with empty string data', async () => {
    const eventWithEmptyData = {
      id: 'uuid-4',
      PartitionKey: PARTITION_KEY,
      category,
      type: PAYMENT_SUBMITTED,
      Timestamp: 1234567893,
      source: 'test-source',
      subject: 'test-subject',
      time: 'test-time',
      data: '',
      toJSON: function () {
        return {
          id: this.id,
          PartitionKey: this.PartitionKey,
          category: this.category,
          type: this.type,
          Timestamp: this.Timestamp,
          source: this.source,
          subject: this.subject,
          time: this.time,
          data: this.data,
        }
      },
    }

    mockFindAll.mockResolvedValue([eventWithEmptyData])
    const result = await getSubmittedEvents(PARTITION_KEY, category)
    expect(result[0].data).toBeNull()
  })

  test('should preserve all event properties', async () => {
    const result = await getSubmittedEvents(PARTITION_KEY, category)

    expect(result[0]).toMatchObject({
      id: mockDbEvents[0].id,
      PartitionKey: mockDbEvents[0].PartitionKey,
      category: mockDbEvents[0].category,
      type: mockDbEvents[0].type,
      Timestamp: mockDbEvents[0].Timestamp,
      source: mockDbEvents[0].source,
      subject: mockDbEvents[0].subject,
      time: mockDbEvents[0].time,
    })

    expect(result[1]).toMatchObject({
      id: mockDbEvents[1].id,
      PartitionKey: mockDbEvents[1].PartitionKey,
      category: mockDbEvents[1].category,
      type: mockDbEvents[1].type,
      Timestamp: mockDbEvents[1].Timestamp,
      source: mockDbEvents[1].source,
      subject: mockDbEvents[1].subject,
      time: mockDbEvents[1].time,
    })
  })

  test('should only return events with PAYMENT_SUBMITTED type', async () => {
    await getSubmittedEvents(PARTITION_KEY, category)
    const callArgs = mockFindAll.mock.calls[0][0]
    expect(callArgs.where.type).toBe(PAYMENT_SUBMITTED)
  })

  test('should filter by category', async () => {
    await getSubmittedEvents(PARTITION_KEY, category)
    const callArgs = mockFindAll.mock.calls[0][0]
    expect(callArgs.where.category).toBe(category)
  })
})

jest.mock('../../../../app/storage')
const { getClient: mockGetClient, odata: mockOdata } = require('../../../../app/storage')

const mockListEntities = jest.fn()
const mockTableClient = { listEntities: mockListEntities }

const { PARTITION_KEY } = require('../../../mocks/values/partition-key')
const { CATEGORY } = require('../../../mocks/values/category')
const { PAYMENT_EVENT } = require('../../../../app/constants/event-types')
const { stringifyEventData } = require('../../../helpers/stringify-event-data')
const { getEvents } = require('../../../../app/data/events/get-events')

let extractedEvent, enrichedEvent, events

describe('get events', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    extractedEvent = structuredClone(require('../../../mocks/events/extracted'))
    enrichedEvent = structuredClone(require('../../../mocks/events/enriched'))

    stringifyEventData(extractedEvent)
    stringifyEventData(enrichedEvent)

    events = [extractedEvent, enrichedEvent]

    mockGetClient.mockReturnValue(mockTableClient)
    mockListEntities.mockReturnValue(events)
  })

  test('should get payment client with payment event type', async () => {
    await getEvents(PARTITION_KEY, CATEGORY)
    expect(mockGetClient).toHaveBeenCalledTimes(1)
    expect(mockGetClient).toHaveBeenCalledWith(PAYMENT_EVENT)
  })

  test('should get payment events with correct filter', async () => {
    await getEvents(PARTITION_KEY, CATEGORY)
    expect(mockListEntities).toHaveBeenCalledTimes(1)
    expect(mockListEntities).toHaveBeenCalledWith({
      queryOptions: { filter: mockOdata`category eq '${CATEGORY}'` }
    })
  })

  test('should return all events and convert data to JSON', async () => {
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result).toHaveLength(events.length)
    result.forEach((e, i) => {
      expect(e.data).toEqual(events[i].data)
    })
  })

  test('should return an empty array if no events', async () => {
    mockListEntities.mockReturnValue([])
    const result = await getEvents(PARTITION_KEY, CATEGORY)
    expect(result).toHaveLength(0)
  })
})

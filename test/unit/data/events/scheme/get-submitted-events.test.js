jest.mock('../../../../../app/storage')
const {
  getClient: mockGetClient,
  odata: mockOdata,
} = require('../../../../../app/storage')

const mockListEntities = jest.fn()
const mockTableClient = { listEntities: mockListEntities }

const { PARTITION_KEY } = require('../../../../mocks/values/partition-key')
const { PAYMENT_SUBMITTED } = require('../../../../../app/constants/events')
const { PAYMENT_EVENT } = require('../../../../../app/constants/event-types')
const {
  stringifyEventData,
} = require('../../../../helpers/stringify-event-data')
const {
  getSubmittedEvents,
} = require('../../../../../app/outbound/events/scheme-id/get-submitted-events')

const category = 'schemeId'

let extractedEvent, enrichedEvent, events

describe('getSubmittedEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    extractedEvent = JSON.parse(
      JSON.stringify(require('../../../../mocks/events/extracted'))
    )
    enrichedEvent = JSON.parse(
      JSON.stringify(require('../../../../mocks/events/enriched'))
    )

    stringifyEventData(extractedEvent)
    stringifyEventData(enrichedEvent)

    events = [extractedEvent, enrichedEvent].map((e) => ({
      ...e,
      data: JSON.stringify(e.data),
    }))

    mockGetClient.mockReturnValue(mockTableClient)
    mockListEntities.mockReturnValue(events)
  })

  test('should call getClient with PAYMENT_EVENT', async () => {
    await getSubmittedEvents(PARTITION_KEY, category)
    expect(mockGetClient).toHaveBeenCalledTimes(1)
    expect(mockGetClient).toHaveBeenCalledWith(PAYMENT_EVENT)
  })

  test('should list entities with correct filters', async () => {
    await getSubmittedEvents(undefined, category)
    expect(mockListEntities).toHaveBeenCalledWith({
      queryOptions: {
        filter: mockOdata`category eq '${category}' and type eq '${PAYMENT_SUBMITTED}'`,
      },
    })

    await getSubmittedEvents(PARTITION_KEY, category)
    expect(mockListEntities).toHaveBeenCalledWith({
      queryOptions: {
        filter: mockOdata`PartitionKey eq '${PARTITION_KEY}' and category eq '${category}' and type eq '${PAYMENT_SUBMITTED}'`,
      },
    })
  })

  test('should return all events with data parsed as JSON', async () => {
    const result = await getSubmittedEvents(PARTITION_KEY, category)
    expect(result).toHaveLength(2)
    expect(result[0].data).toEqual(extractedEvent.data)
    expect(result[1].data).toEqual(enrichedEvent.data)
  })

  test('should return empty array when no events', async () => {
    mockListEntities.mockReturnValue([])
    const result = await getSubmittedEvents(PARTITION_KEY, category)
    expect(result).toEqual([])
  })
})

jest.mock('../../../../../app/data/events/get-events')
const { getEvents: mockGetEvents } = require('../../../../../app/data/events/get-events')

jest.mock('../../../../../app/data/events/frn/group-events-by-frn')
const { groupEventsByFrn: mockGroupEventsByFrn } = require('../../../../../app/data/events/frn/group-events-by-frn')

jest.mock('../../../../../app/data/events/order-grouped-events')
const { orderGroupedEvents: mockOrderGroupedEvents } = require('../../../../../app/data/events/order-grouped-events')

jest.mock('../../../../../app/data/events/sanitise-events')
const { sanitiseEvents: mockSanitiseEvents } = require('../../../../../app/data/events/sanitise-events')

jest.mock('../../../../../app/data/events/add-values')
const { addValues: mockAddValues } = require('../../../../../app/data/events/add-values')

const { FRN: FRN_VALUE } = require('../../../../mocks/values/frn')
const enriched = require('../../../../mocks/events/enriched')
const groupedEvent = require('../../../../mocks/events/grouped-event')

const { FRN: FRN_CATEGORY } = require('../../../../../app/constants/categories')

const { getEventsByFrn } = require('../../../../../app/data/events/frn/get-events-by-frn')

describe('get events by frn', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockGetEvents.mockResolvedValue([enriched])
    mockGroupEventsByFrn.mockReturnValue(groupedEvent)
    mockOrderGroupedEvents.mockReturnValue(groupedEvent)
    mockSanitiseEvents.mockReturnValue(groupedEvent)
    mockAddValues.mockReturnValue(groupedEvent)
  })

  const testCases = [
    ['get events for FRN', async () => {
      await getEventsByFrn(FRN_VALUE)
      expect(mockGetEvents).toHaveBeenCalledWith(FRN_VALUE, FRN_CATEGORY)
    }],
    ['group events by FRN', async () => {
      await getEventsByFrn(FRN_VALUE)
      expect(mockGroupEventsByFrn).toHaveBeenCalledWith([enriched])
    }],
    ['order grouped events', async () => {
      await getEventsByFrn(FRN_VALUE)
      expect(mockOrderGroupedEvents).toHaveBeenCalledWith(groupedEvent)
    }],
    ['sanitise events', async () => {
      await getEventsByFrn(FRN_VALUE)
      expect(mockSanitiseEvents).toHaveBeenCalledWith(groupedEvent)
    }],
    ['add values to events', async () => {
      await getEventsByFrn(FRN_VALUE)
      expect(mockAddValues).toHaveBeenCalledWith(groupedEvent)
    }]
  ]

  test.each(testCases)('%s', async (_, fn) => {
    await fn()
  })
})

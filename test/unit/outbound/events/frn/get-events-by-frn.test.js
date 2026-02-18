jest.mock('../../../../../app/outbound/events/get-events')
const {
  getEvents: mockGetEvents,
} = require('../../../../../app/outbound/events/get-events')

jest.mock('../../../../../app/outbound/events/frn/group-events-by-frn')
const {
  groupEventsByFrn: mockGroupEventsByFrn,
} = require('../../../../../app/outbound/events/frn/group-events-by-frn')

jest.mock('../../../../../app/outbound/events/order-grouped-events')
const {
  orderGroupedEvents: mockOrderGroupedEvents,
} = require('../../../../../app/outbound/events/order-grouped-events')

jest.mock('../../../../../app/outbound/events/sanitise-events')
const {
  sanitiseEvents: mockSanitiseEvents,
} = require('../../../../../app/outbound/events/sanitise-events')

jest.mock('../../../../../app/outbound/events/add-values')
const {
  addValues: mockAddValues,
} = require('../../../../../app/outbound/events/add-values')

const { FRN: FRN_VALUE } = require('../../../../mocks/values/frn')
const enriched = require('../../../../mocks/events/enriched')
const groupedEvent = require('../../../../mocks/events/grouped-event')

const {
  FRN: FRN_CATEGORY,
} = require('../../../../../app/constants/categories')

const {
  getEventsByFrn,
} = require('../../../../../app/outbound/events/frn/get-events-by-frn')

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
    [
      'get events for FRN',
      async () => {
        await getEventsByFrn(FRN_VALUE)
        expect(mockGetEvents).toHaveBeenCalledWith(FRN_VALUE, FRN_CATEGORY)
      },
    ],
    [
      'group events by FRN',
      async () => {
        await getEventsByFrn(FRN_VALUE)
        expect(mockGroupEventsByFrn).toHaveBeenCalledWith([enriched])
      },
    ],
    [
      'order grouped events',
      async () => {
        await getEventsByFrn(FRN_VALUE)
        expect(mockOrderGroupedEvents).toHaveBeenCalledWith(groupedEvent)
      },
    ],
    [
      'sanitise events',
      async () => {
        await getEventsByFrn(FRN_VALUE)
        expect(mockSanitiseEvents).toHaveBeenCalledWith(groupedEvent)
      },
    ],
    [
      'add values to events',
      async () => {
        await getEventsByFrn(FRN_VALUE)
        expect(mockAddValues).toHaveBeenCalledWith(groupedEvent)
      },
    ],
  ]

  test.each(testCases)('%s', async (_, fn) => {
    await fn()
  })
})

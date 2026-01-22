jest.mock('../../../../../app/data/events/get-events')
jest.mock('../../../../../app/data/events/group-events-by-correlation-id')
jest.mock('../../../../../app/data/events/correlation-id/order-grouped-events')
jest.mock('../../../../../app/data/events/sanitise-events')
jest.mock('../../../../../app/data/events/add-pending-events')

const { getEvents: mockGetEvents } = require('../../../../../app/data/events/get-events')
const { groupEventsByCorrelationId: mockGroupEventsByCorrelationId } = require('../../../../../app/data/events/group-events-by-correlation-id')
const { orderGroupedEvents: mockOrderGroupedEvents } = require('../../../../../app/data/events/correlation-id/order-grouped-events')
const { sanitiseEvents: mockSanitiseEvents } = require('../../../../../app/data/events/sanitise-events')
const { addPendingEvents: mockAddPendingEvents } = require('../../../../../app/data/events/add-pending-events')

const { CORRELATION_ID: CORRELATION_ID_VALUE } = require('../../../../mocks/values/correlation-id')
const { CORRELATION_ID: CORRELATION_ID_CATEGORY } = require('../../../../../app/constants/categories')
const enriched = require('../../../../mocks/events/enriched')
const groupedEvent = require('../../../../mocks/events/grouped-event')

const { getEventsByCorrelationId } = require('../../../../../app/data/events/correlation-id/get-events-by-correlation-id')

describe('getEventsByCorrelationId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetEvents.mockResolvedValue([enriched])
    mockGroupEventsByCorrelationId.mockReturnValue(groupedEvent)
    mockOrderGroupedEvents.mockReturnValue(groupedEvent)
    mockSanitiseEvents.mockReturnValue(groupedEvent)
    mockAddPendingEvents.mockReturnValue([groupedEvent])
  })

  test('should fetch, process, and return events correctly', async () => {
    const result = await getEventsByCorrelationId(CORRELATION_ID_VALUE)

    expect(mockGetEvents).toHaveBeenCalledWith(CORRELATION_ID_VALUE, CORRELATION_ID_CATEGORY)
    expect(mockGroupEventsByCorrelationId).toHaveBeenCalledWith([enriched])
    expect(mockOrderGroupedEvents).toHaveBeenCalledWith(groupedEvent)
    expect(mockSanitiseEvents).toHaveBeenCalledWith(groupedEvent)
    expect(mockAddPendingEvents).toHaveBeenCalledWith(groupedEvent)
    expect(result).toEqual(groupedEvent)
  })
})

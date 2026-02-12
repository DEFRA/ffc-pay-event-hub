jest.mock('../../../../../app/outbound/events/get-events')
jest.mock('../../../../../app/outbound/events/batch/group-events-by-frn')
jest.mock('../../../../../app/outbound/events/order-grouped-events')
jest.mock('../../../../../app/outbound/events/sanitise-events')
jest.mock('../../../../../app/outbound/events/add-values')

const {
  getEvents: mockGetEvents,
} = require('../../../../../app/outbound/events/get-events')
const {
  groupEventsByFrn: mockGroupEventsByFrn,
} = require('../../../../../app/outbound/events/batch/group-events-by-frn')
const {
  orderGroupedEvents: mockOrderGroupedEvents,
} = require('../../../../../app/outbound/events/order-grouped-events')
const {
  sanitiseEvents: mockSanitiseEvents,
} = require('../../../../../app/outbound/events/sanitise-events')
const {
  addValues: mockAddValues,
} = require('../../../../../app/outbound/events/add-values')

const enriched = require('../../../../mocks/events/enriched')
const groupedEvent = require('../../../../mocks/events/grouped-event')
const { BATCH: BATCH_VALUE } = require('../../../../mocks/values/batch')
const {
  BATCH: BATCH_CATEGORY,
} = require('../../../../../app/constants/categories')

const {
  getEventsByBatch,
} = require('../../../../../app/outbound/events/batch/get-events-by-batch')

describe('getEventsByBatch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetEvents.mockResolvedValue([enriched])
    mockGroupEventsByFrn.mockReturnValue(groupedEvent)
    mockOrderGroupedEvents.mockReturnValue(groupedEvent)
    mockSanitiseEvents.mockReturnValue(groupedEvent)
    mockAddValues.mockReturnValue(groupedEvent)
  })

  test('fetches events for batch', async () => {
    await getEventsByBatch(BATCH_VALUE)
    expect(mockGetEvents).toHaveBeenCalledWith(BATCH_VALUE, BATCH_CATEGORY)
  })

  test('processes events through grouping, ordering, sanitising, and adding values', async () => {
    await getEventsByBatch(BATCH_VALUE)

    expect(mockGroupEventsByFrn).toHaveBeenCalledWith([enriched])
    expect(mockOrderGroupedEvents).toHaveBeenCalledWith(groupedEvent)
    expect(mockSanitiseEvents).toHaveBeenCalledWith(groupedEvent)
    expect(mockAddValues).toHaveBeenCalledWith(groupedEvent)
  })
})

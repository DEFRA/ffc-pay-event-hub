jest.mock('../../../../../app/data/events/scheme-id/get-submitted-events')
const { getSubmittedEvents: mockGetSubmittedEvents } = require('../../../../../app/data/events/scheme-id/get-submitted-events')

jest.mock('../../../../../app/data/events/scheme-id/group-events-by-scheme')
const { groupEventsByScheme: mockGroupEventsByScheme } = require('../../../../../app/data/events/scheme-id/group-events-by-scheme')

jest.mock('../../../../../app/data/events/scheme-id/order-grouped-events-by-scheme')
const { orderGroupedEventsByScheme: mockOrderGroupedEventsByScheme } = require('../../../../../app/data/events/scheme-id/order-grouped-events-by-scheme')

jest.mock('../../../../../app/data/events/scheme-id/get-total-scheme-values')
const { getTotalSchemeValues: mockGetTotalSchemeValues } = require('../../../../../app/data/events/scheme-id/get-total-scheme-values')

jest.mock('../../../../../app/data/events/scheme-id/sanitise-scheme-data')
const { sanitiseSchemeData: mockSanitiseSchemeData } = require('../../../../../app/data/events/scheme-id/sanitise-scheme-data')

const submitted = require('../../../../mocks/events/submitted')
const groupedEvent = require('../../../../mocks/events/grouped-event')
const totalSchemeValues = require('../../../../mocks/total-scheme-values')

const { SCHEME_ID: SCHEME_ID_CATEGORY } = require('../../../../../app/constants/categories')

const { getEventsByScheme } = require('../../../../../app/data/events/scheme-id/get-events-by-scheme')
const { SFI } = require('../../../../../app/constants/schemes')

describe('get events by scheme', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetSubmittedEvents.mockResolvedValue([submitted])
    mockGroupEventsByScheme.mockReturnValue([groupedEvent])
    mockGetTotalSchemeValues.mockReturnValue([totalSchemeValues])
    mockOrderGroupedEventsByScheme.mockReturnValue([totalSchemeValues])
  })

  const cases = [
    ['should get events for schemeId', () => mockGetSubmittedEvents, [SFI, SCHEME_ID_CATEGORY]],
    ['should group events by scheme', () => mockGroupEventsByScheme, [[submitted]]],
    ['should get total values for scheme', () => mockGetTotalSchemeValues, [[groupedEvent]]],
    ['should order grouped events', () => mockOrderGroupedEventsByScheme, [[totalSchemeValues]]],
    ['should sanitise events', () => mockSanitiseSchemeData, [[totalSchemeValues]]]
  ]

  test.each(cases)('%s', async (_, mockFnGetter, expectedArgs) => {
    await getEventsByScheme(SFI)
    expect(mockFnGetter()).toHaveBeenCalledWith(...expectedArgs)
  })
})

const submitted = require('../../../../mocks/events/submitted')
const {
  BPS, CS, SFI, SFI23, DELINKED, SFI_EXPANDED, COHT_REVENUE, COHT_CAPITAL
} = require('../../../../../app/constants/schemes')
const { groupEventsByScheme } = require('../../../../../app/data/events/scheme-id/group-events-by-scheme')

let mixedSchemeEvents

describe('group events by scheme', () => {
  beforeEach(() => {
    const createEventsForScheme = (scheme) => [submitted, submitted].map(e => ({ ...e, partitionKey: scheme }))

    mixedSchemeEvents = [
      ...createEventsForScheme(BPS),
      ...createEventsForScheme(CS),
      ...createEventsForScheme(SFI),
      ...createEventsForScheme(SFI23),
      ...createEventsForScheme(DELINKED),
      ...createEventsForScheme(SFI_EXPANDED),
      ...createEventsForScheme(COHT_REVENUE),
      ...createEventsForScheme(COHT_CAPITAL)
    ]
  })

  test('all events in each group have schemeId equal to partitionKey', () => {
    const groupedEvents = groupEventsByScheme(mixedSchemeEvents)
    groupedEvents.forEach(group =>
      group.events.forEach(event => expect(group.schemeId).toBe(event.partitionKey))
    )
  })
})

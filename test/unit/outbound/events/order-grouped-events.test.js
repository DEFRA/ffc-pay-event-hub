const acknowledged = require('../../../mocks/events/acknowledged')
const enriched = require('../../../mocks/events/enriched')
const processed = require('../../../mocks/events/processed')
const submitted = require('../../../mocks/events/submitted')

const {
  orderGroupedEvents,
} = require('../../../../app/outbound/events/order-grouped-events')

let groupedEvent

describe('order grouped events', () => {
  beforeEach(() => {
    groupedEvent = structuredClone(
      require('../../../mocks/events/grouped-event')
    )
    groupedEvent.events = [acknowledged, processed, enriched, submitted]
  })

  test('should order events within group to correct sequence', () => {
    const orderedGroupedEvents = orderGroupedEvents([groupedEvent])
    expect(orderedGroupedEvents[0].events[0]).toEqual(enriched)
    expect(orderedGroupedEvents[0].events[1]).toEqual(processed)
    expect(orderedGroupedEvents[0].events[2]).toEqual(submitted)
    expect(orderedGroupedEvents[0].events[3]).toEqual(acknowledged)
  })
})

const { PARTITION_KEY } = require('../../../../mocks/values/partition-key')
const enriched = require('../../../../mocks/events/enriched')
const processed = require('../../../../mocks/events/processed')
const submitted = require('../../../../mocks/events/submitted')
const acknowledged = require('../../../../mocks/events/acknowledged')

const { groupEventsByCorrelationId } = require('../../../../../app/data/events/group-events-by-correlation-id')

describe('group events by correlation id', () => {
  let events
  let groupedEvents

  beforeEach(() => {
    events = [enriched, processed, submitted, acknowledged]
    groupedEvents = groupEventsByCorrelationId(events)
  })

  const testCases = [
    ['correlationId', PARTITION_KEY],
    ['frn', enriched.data.frn],
    ['schemeId', enriched.data.schemeId],
    ['paymentRequestNumber', enriched.data.paymentRequestNumber],
    ['agreementNumber', enriched.data.agreementNumber],
    ['marketingYear', enriched.data.marketingYear]
  ]

  test.each(testCases)(
    'should include %s in group with correct value',
    (property, expected) => {
      expect(groupedEvents[0][property]).toEqual(expected)
    }
  )

  test('should include events in group with correct value', () => {
    const groupedEventIds = groupedEvents[0].events.map(e => e.id)
    const originalEventIds = events.map(e => e.id)
    expect(groupedEventIds).toEqual(originalEventIds)
  })
})

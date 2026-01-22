const { PARTITION_KEY } = require('../../../../mocks/values/partition-key')
const { ROW_KEY } = require('../../../../mocks/values/row-key')
const enriched = require('../../../../mocks/events/enriched')
const processed = require('../../../../mocks/events/processed')
const submitted = require('../../../../mocks/events/submitted')
const acknowledged = require('../../../../mocks/events/acknowledged')

const { groupEventsByFrn } = require('../../../../../app/data/events/frn/group-events-by-frn')

describe('group events by FRN', () => {
  let events
  let groupedEvents

  beforeEach(() => {
    events = [enriched, processed, submitted, acknowledged]
    groupedEvents = groupEventsByFrn(events)
  })

  const cases = [
    ['should group events with partition key as FRN', () => groupedEvents[0].frn, PARTITION_KEY],
    ['should include events with first element of row key as correlation id', () => groupedEvents[0].correlationId, ROW_KEY.split('|')[0]],
    ['should include scheme id in group', () => groupedEvents[0].schemeId, enriched.data.schemeId],
    ['should include payment request number in group', () => groupedEvents[0].paymentRequestNumber, enriched.data.paymentRequestNumber],
    ['should include agreement number in group', () => groupedEvents[0].agreementNumber, enriched.data.agreementNumber],
    ['should include marketing year in group', () => groupedEvents[0].marketingYear, enriched.data.marketingYear]
  ]

  test.each(cases)('%s', (_, actualFn, expected) => {
    expect(actualFn()).toEqual(expected)
  })

  test('should include events in group', () => {
    const groupedEventIds = groupedEvents[0].events.map(e => e.id)
    const originalEventIds = events.map(e => e.id)
    expect(groupedEventIds).toEqual(originalEventIds)
  })
})

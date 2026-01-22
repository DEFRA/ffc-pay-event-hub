const { PARTITION_KEY } = require('../../../../mocks/values/partition-key')
const { ROW_KEY } = require('../../../../mocks/values/row-key')
const enriched = require('../../../../mocks/events/enriched')
const processed = require('../../../../mocks/events/processed')
const submitted = require('../../../../mocks/events/submitted')
const acknowledged = require('../../../../mocks/events/acknowledged')

const { groupEventsByFrn } = require('../../../../../app/data/events/batch/group-events-by-frn')

let events
let groupedEvents

describe('groupEventsByFrn', () => {
  beforeEach(() => {
    events = [enriched, processed, submitted, acknowledged]
    groupedEvents = groupEventsByFrn(events)
  })

  test('should group events with partition key as batch name', () => {
    expect(groupedEvents[0].batch).toBe(PARTITION_KEY)
  })

  test('should include events array in group', () => {
    expect(groupedEvents[0].events).toEqual(events)
  })

  test.each([
    ['frn', ROW_KEY.split('|')[0]],
    ['schemeId', enriched.data.schemeId],
    ['paymentRequestNumber', enriched.data.paymentRequestNumber],
    ['agreementNumber', enriched.data.agreementNumber],
    ['marketingYear', enriched.data.marketingYear]
  ])('should include %s in group', (field, expected) => {
    expect(groupedEvents[0][field]).toBe(expected)
  })
})

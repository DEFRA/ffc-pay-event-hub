const {
  sanitiseEvents,
} = require('../../../../app/outbound/events/sanitise-events')

const enriched = require('../../../mocks/events/enriched')
const extracted = require('../../../mocks/events/extracted')
const processed = require('../../../mocks/events/processed')
const submitted = require('../../../mocks/events/submitted')
const acknowledged = require('../../../mocks/events/acknowledged')

const { 1: SFI } = require('../../../../app/constants/scheme-names')
const {
  PAYMENT_ACKNOWLEDGED_STATUS,
  PAYMENT_ENRICHED_STATUS,
} = require('../../../../app/constants/statuses')
const {
  PAYMENT_ACKNOWLEDGED_NAME,
  PAYMENT_ENRICHED_NAME,
} = require('../../../../app/constants/names')
const { COMPLETED, IN_PROGRESS } = require('../../../../app/constants/states')

let groupedEvent
let result

describe('sanitise events', () => {
  beforeEach(() => {
    groupedEvent = structuredClone(
      require('../../../mocks/events/grouped-event')
    )

    groupedEvent.events = [enriched, processed, submitted, acknowledged]

    result = sanitiseEvents([groupedEvent])[0]
  })

  test('should return empty array if no events', () => {
    expect(sanitiseEvents([])).toHaveLength(0)
  })

  test('should include all group level properties', () => {
    expect(result).toMatchObject(groupedEvent)
  })

  test('should add scheme name', () => {
    expect(result.scheme).toBe(SFI)
  })

  test('should add status based on last event', () => {
    const { status } = result

    expect(status).toMatchObject({
      name: PAYMENT_ACKNOWLEDGED_NAME,
      detail: PAYMENT_ACKNOWLEDGED_STATUS,
      state: COMPLETED,
      default: true,
    })
  })

  test('should add lastUpdated as London formatted string', () => {
    expect(result.lastUpdated).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
  })

  test('should include all events in group', () => {
    expect(result.events).toHaveLength(4)
  })

  test('should include all event properties and add status/timestamp', () => {
    const event = result.events[0]

    expect(event).toMatchObject(enriched)

    expect(event.status).toMatchObject({
      name: PAYMENT_ENRICHED_NAME,
      detail: PAYMENT_ENRICHED_STATUS,
      state: IN_PROGRESS,
      default: true,
    })

    expect(event.timestamp).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
  })

  test('should convert extracted event value to pence but not others', () => {
    const extractedEventGroup = structuredClone(groupedEvent)
    extractedEventGroup.events = [extracted]

    let res = sanitiseEvents([extractedEventGroup])[0]
    expect(res.events[0].data.value).toBe(100000)

    extractedEventGroup.events = [enriched]
    res = sanitiseEvents([extractedEventGroup])[0]
    expect(res.events[0].data.value).toBe(100000)
  })
})

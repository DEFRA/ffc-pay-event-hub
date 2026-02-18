const {
  PAYMENT_ENRICHED_NAME,
  PAYMENT_PROCESSED_NAME,
  PAYMENT_SUBMITTED_NAME,
  PAYMENT_ACKNOWLEDGED_NAME,
  PAYMENT_PROCESSED_NO_FURTHER_ACTION_NAME,
} = require('../../../../app/constants/names')

const enriched = require('../../../mocks/events/enriched')
const processed = require('../../../mocks/events/processed')
const submitted = require('../../../mocks/events/submitted')
const acknowledged = require('../../../mocks/events/acknowledged')
const processedNoFurtherAction = require('../../../mocks/events/processed-no-futher-action')

const {
  addPendingEvents,
} = require('../../../../app/outbound/events/add-pending-events')
const {
  PAYMENT_PROCESSED_NO_FURTHER_ACTION_STATUS,
} = require('../../../../app/constants/statuses')

let groupedEvent

describe('add pending events', () => {
  beforeEach(() => {
    groupedEvent = structuredClone(
      require('../../../mocks/events/grouped-event')
    )
  })

  const eventsMap = [
    { name: PAYMENT_ENRICHED_NAME, existingEvent: enriched },
    { name: PAYMENT_PROCESSED_NAME, existingEvent: processed },
    { name: PAYMENT_SUBMITTED_NAME, existingEvent: submitted },
    { name: PAYMENT_ACKNOWLEDGED_NAME, existingEvent: acknowledged },
  ]

  test('should add all default events if no events exist', () => {
    const result = addPendingEvents([groupedEvent])
    expect(result[0].events).toHaveLength(eventsMap.length)
  })

  test.each(eventsMap)('should add %s event if not present', ({ name }) => {
    const result = addPendingEvents([groupedEvent])
    expect(result[0].events.find((e) => e.status.name === name)).toBeDefined()
  })

  test.each(eventsMap)(
    'should not add %s event if it already exists',
    ({ existingEvent }) => {
      groupedEvent.events = [existingEvent]
      const result = addPendingEvents([groupedEvent])
      expect(result[0].events).toHaveLength(eventsMap.length)
    }
  )

  test('should not add any events if grouped event has PAYMENT_PROCESSED_NO_FURTHER_ACTION_STATUS', () => {
    groupedEvent.events = [processedNoFurtherAction]
    groupedEvent.status = {
      detail: PAYMENT_PROCESSED_NO_FURTHER_ACTION_STATUS,
      name: PAYMENT_PROCESSED_NO_FURTHER_ACTION_NAME,
    }
    const result = addPendingEvents([groupedEvent])
    expect(result[0].events).toHaveLength(1)
    expect(result[0].status.detail).toBe(
      PAYMENT_PROCESSED_NO_FURTHER_ACTION_STATUS
    )
  })
})

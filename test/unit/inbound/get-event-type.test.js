const { BATCH_EVENT_PREFIX, WARNING_EVENT_PREFIX, HOLD_EVENT_PREFIX, PAYMENT_EVENT_PREFIX } = require('../../../app/constants/event-prefixes')
const { BATCH_EVENT, WARNING_EVENT, HOLD_EVENT, PAYMENT_EVENT } = require('../../../app/constants/event-types')
const { getEventType } = require('../../../app/inbound/get-event-type')

describe('get event type', () => {
  test('should return payment event type for payment event prefix', () => {
    const eventType = getEventType(PAYMENT_EVENT_PREFIX)
    expect(eventType).toBe(PAYMENT_EVENT)
  })

  test('should return payment event type for payment event if starts with prefix', () => {
    const eventType = getEventType(`${PAYMENT_EVENT_PREFIX}.event`)
    expect(eventType).toBe(PAYMENT_EVENT)
  })

  test('should return hold event type for hold event prefix', () => {
    const eventType = getEventType(HOLD_EVENT_PREFIX)
    expect(eventType).toBe(HOLD_EVENT)
  })

  test('should return hold event type for hold event if starts with prefix', () => {
    const eventType = getEventType(`${HOLD_EVENT_PREFIX}.event`)
    expect(eventType).toBe(HOLD_EVENT)
  })

  test('should return warning event type for warning event prefix', () => {
    const eventType = getEventType(WARNING_EVENT_PREFIX)
    expect(eventType).toBe(WARNING_EVENT)
  })

  test('should return warning event type for warning event if starts with prefix', () => {
    const eventType = getEventType(`${WARNING_EVENT_PREFIX}.event`)
    expect(eventType).toBe(WARNING_EVENT)
  })

  test('should return batch event type for batch event prefix', () => {
    const eventType = getEventType(BATCH_EVENT_PREFIX)
    expect(eventType).toBe(BATCH_EVENT)
  })

  test('should return batch event type for batch event if starts with prefix', () => {
    const eventType = getEventType(`${BATCH_EVENT_PREFIX}.event`)
    expect(eventType).toBe(BATCH_EVENT)
  })

  test('should throw error for unknown event type', () => {
    expect(() => getEventType('uk.gov.defra.ffc.unknown.event')).toThrowError('Unknown event type: uk.gov.defra.ffc.unknown.event')
  })
})

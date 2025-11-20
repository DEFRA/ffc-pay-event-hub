const {
  BATCH_EVENT_PREFIX,
  WARNING_EVENT_PREFIX,
  HOLD_EVENT_PREFIX,
  PAYMENT_EVENT_PREFIX
} = require('../../../app/constants/event-prefixes')
const {
  BATCH_EVENT,
  WARNING_EVENT,
  HOLD_EVENT,
  PAYMENT_EVENT
} = require('../../../app/constants/event-types')
const { getEventType } = require('../../../app/inbound/get-event-type')

describe('get event type', () => {
  const cases = [
    [PAYMENT_EVENT_PREFIX, PAYMENT_EVENT],
    [`${PAYMENT_EVENT_PREFIX}.event`, PAYMENT_EVENT],
    [HOLD_EVENT_PREFIX, HOLD_EVENT],
    [`${HOLD_EVENT_PREFIX}.event`, HOLD_EVENT],
    [WARNING_EVENT_PREFIX, WARNING_EVENT],
    [`${WARNING_EVENT_PREFIX}.event`, WARNING_EVENT],
    [BATCH_EVENT_PREFIX, BATCH_EVENT],
    [`${BATCH_EVENT_PREFIX}.event`, BATCH_EVENT]
  ]

  test.each(cases)('returns %s maps to %s', (input, expected) => {
    expect(getEventType(input)).toBe(expected)
  })

  test('throws error for unknown event type', () => {
    const unknown = 'uk.gov.defra.ffc.unknown.event'
    expect(() => getEventType(unknown)).toThrow(`Unknown event type: ${unknown}`)
  })
})

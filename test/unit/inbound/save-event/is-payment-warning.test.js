const { isPaymentWarning } = require('../../../../app/inbound/save-event/is-payment-warning')
const { PAYMENT_WARNINGS } = require('../../../../app/constants/payment-warnings')
const {
  WARNING_BATCH_REJECTED,
  WARNING_PAYMENT_SETTLEMENT_UNMATCHED,
  WARNING_PAYMENT_REJECTED,
  WARNING_EVENT_SAVE_ALERT
} = require('../../../../app/constants/events')
const paymentEvent = require('../../../mocks/events/payment')

let event

describe('is payment warning', () => {
  beforeEach(() => {
    event = structuredClone({ ...paymentEvent, type: WARNING_PAYMENT_REJECTED })
    event.data.message = 'Payment request rejected'
  })

  test.each(PAYMENT_WARNINGS)('returns true for %s with payment request data', (type) => {
    event.type = type
    expect(isPaymentWarning(event)).toBe(true)
  })

  test.each([
    WARNING_BATCH_REJECTED,
    WARNING_PAYMENT_SETTLEMENT_UNMATCHED,
    WARNING_EVENT_SAVE_ALERT
  ])('returns false for %s even with payment request data', (type) => {
    event.type = type
    expect(isPaymentWarning(event)).toBe(false)
  })

  test.each(['frn', 'correlationId', 'schemeId', 'invoiceNumber'])('returns false if %s missing', (key) => {
    delete event.data[key]
    expect(isPaymentWarning(event)).toBe(false)
  })

  test('returns false if correlationId is not a guid', () => {
    event.data.correlationId = 'not-a-guid'
    expect(isPaymentWarning(event)).toBe(false)
  })

  test('returns false if data missing', () => {
    delete event.data
    expect(isPaymentWarning(event)).toBe(false)
  })
})

const COMMON_EVENT_PREFIX = 'uk.gov.defra.ffc.pay.'

module.exports = {
  PAYMENT_EVENT_PREFIX: `${COMMON_EVENT_PREFIX}payment.`,
  HOLD_EVENT_PREFIX: `${COMMON_EVENT_PREFIX}hold.`,
  WARNING_EVENT_PREFIX: `${COMMON_EVENT_PREFIX}warning.`
}

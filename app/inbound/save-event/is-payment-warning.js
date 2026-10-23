const { PAYMENT_WARNINGS } = require('../../constants/payment-warnings')
const paymentSchema = require('../schemas/payment')

const isPaymentWarning = (event) => {
  if (!PAYMENT_WARNINGS.includes(event.type) || !event.data?.frn) {
    return false
  }
  const validationResult = paymentSchema.validate(event.data, { abortEarly: false, allowUnknown: true })
  return !validationResult.error
}

module.exports = {
  isPaymentWarning
}

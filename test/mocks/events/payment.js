const event = require('./event')
const { PAYMENT_TYPE } = require('../values/type')
const { CORRELATION_ID } = require('../values/correlation-id')
const { FRN } = require('../values/frn')
const { SCHEME_ID } = require('../values/scheme-id')
const { INVOICE_NUMBER } = require('../values/invoice-number')

module.exports = {
  ...event,
  type: PAYMENT_TYPE,
  data: {
    frn: FRN,
    correlationId: CORRELATION_ID,
    schemeId: SCHEME_ID,
    invoiceNumber: INVOICE_NUMBER
  }
}

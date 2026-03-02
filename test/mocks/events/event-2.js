const { PARTITION_KEY } = require('../values/partition-key')
const { ROW_KEY } = require('../values/row-key')
const { SPEC_VERSION } = require('../values/spec-version')
const { TYPE } = require('../values/type')
const { SOURCE } = require('../values/source')
const { ID } = require('../values/id')
const { TIME } = require('../values/time')
const { DATA_CONTENT_TYPE } = require('../values/data-content-type')
const { FRN } = require('../values/frn')
const { CORRELATION_ID } = require('../values/correlation-id')
const { SCHEME_ID } = require('../values/scheme-id')
const { INVOICE_NUMBER } = require('../values/invoice-number')
const { CONTRACT_NUMBER } = require('../values/contract-number')
const { BATCH } = require('../values/batch')
const { PAYMENT_REQUEST_NUMBER } = require('../values/payment-request-number')
const { MARKETING_YEAR } = require('../values/marketing-year')
const { SOURCE_SYSTEM } = require('../values/source-system')
const { AGREEMENT_NUMBER } = require('../values/agreement-number')
const { VALUE } = require('../values/value')

module.exports = {
  partitionKey: PARTITION_KEY,
  rowKey: ROW_KEY,
  specversion: SPEC_VERSION,
  type: TYPE,
  source: SOURCE,
  id: ID,
  time: TIME,
  datacontenttype: DATA_CONTENT_TYPE,
  data: {
    frn: FRN,
    correlationId: CORRELATION_ID,
    schemeId: SCHEME_ID,
    invoiceNumber: INVOICE_NUMBER,
    contractNumber: CONTRACT_NUMBER,
    batch: BATCH,
    paymentRequestNumber: PAYMENT_REQUEST_NUMBER,
    marketingYear: MARKETING_YEAR,
    sourceSystem: SOURCE_SYSTEM,
    agreementNumber: AGREEMENT_NUMBER,
    value: VALUE
  }
}

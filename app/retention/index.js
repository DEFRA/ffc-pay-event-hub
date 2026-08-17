const db = require('../data')
const { removePaymentBatchEvents } = require('./remove-payment-batch-events')
const { removePaymentFRNEvents } = require('./remove-payment-frn-events')
const { removePayments } = require('./remove-payments')
const { removeWarnings } = require('./remove-warnings')

const removeAgreementData = async (retentionData) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { agreementNumber, frn, schemeId, usesContractNumber } = retentionData

    await removeWarnings(agreementNumber, frn, schemeId, usesContractNumber, transaction)
    const { batches, agreementNumbers, correlationIds } = await removePayments(agreementNumber, frn, schemeId, usesContractNumber, transaction)
    await removePaymentBatchEvents(agreementNumber, frn, schemeId, usesContractNumber, batches, agreementNumbers, transaction)
    await removePaymentFRNEvents(agreementNumber, frn, schemeId, usesContractNumber, correlationIds, agreementNumbers, transaction)

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = {
  removeAgreementData
}

const db = require('../data')

const removePaymentBatchEvents = async (agreementNumber, frn, schemeId, usesContractNumber, transaction) => {
  const where = {
    agreementNumber,
    frn,
    schemeId
  }
  if (usesContractNumber) {
    delete where.agreementNumber
    where.contractNumber = agreementNumber
  }
  await db.paymentBatchEvents.destroy({
    where,
    transaction
  })
}

module.exports = {
  removePaymentBatchEvents
}

const db = require('../data')

const removePaymentFRNEvents = async (agreementNumber, frn, schemeId, usesContractNumber, transaction) => {
  const where = {
    agreementNumber,
    frn,
    schemeId
  }
  if (usesContractNumber) {
    delete where.agreementNumber
    where.contractNumber = agreementNumber
  }
  await db.paymentFrnEvents.destroy({
    where,
    transaction
  })
}

module.exports = {
  removePaymentFRNEvents
}

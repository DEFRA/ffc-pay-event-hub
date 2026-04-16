const db = require('../data')

const removePaymentFRNEvents = async (agreementNumber, frn, schemeId, transaction) => {
  await db.paymentFrnEvents.destroy({
    where: { agreementNumber, frn, schemeId },
    transaction
  })
}

module.exports = {
  removePaymentFRNEvents
}

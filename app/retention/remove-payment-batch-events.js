const db = require('../data')

const removePaymentBatchEvents = async (agreementNumber, frn, schemeId, transaction) => {
  await db.paymentBatchEvents.destroy({
    where: { agreementNumber, frn, schemeId },
    transaction
  })
}

module.exports = {
  removePaymentBatchEvents
}

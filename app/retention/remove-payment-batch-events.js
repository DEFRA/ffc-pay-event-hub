const db = require('../data')

const removePaymentBatchEvents = async (
  agreementNumber,
  frn,
  schemeId,
  usesContractNumber,
  batches,
  agreementNumbers,
  transaction
) => {
  if (usesContractNumber) {
    if (!batches.length || !agreementNumbers.length) {
      return
    }

    await db.paymentBatchEvents.destroy({
      where: {
        batchName: {
          [db.Sequelize.Op.in]: batches
        },
        agreementNumber: {
          [db.Sequelize.Op.in]: agreementNumbers
        },
        frn,
        schemeId
      },
      transaction
    })

    return
  }

  await db.paymentBatchEvents.destroy({
    where: {
      agreementNumber,
      frn,
      schemeId
    },
    transaction
  })
}

module.exports = {
  removePaymentBatchEvents
}

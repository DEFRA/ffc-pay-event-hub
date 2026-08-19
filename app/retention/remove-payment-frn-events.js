const db = require('../data')

const removePaymentFRNEvents = async (
  agreementNumber,
  frn,
  schemeId,
  usesContractNumber,
  correlationIds,
  agreementNumbers,
  transaction
) => {
  if (usesContractNumber) {
    if (!correlationIds.length || !agreementNumbers.length) {
      return
    }
    await db.paymentFrnEvents.destroy({
      where: {
        correlationId: {
          [db.Sequelize.Op.in]: correlationIds
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

  await db.paymentFrnEvents.destroy({
    where: {
      agreementNumber,
      frn,
      schemeId
    },
    transaction
  })
}

module.exports = {
  removePaymentFRNEvents
}

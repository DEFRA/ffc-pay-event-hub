const db = require('../data')

const removePayments = async (agreementNumber, frn, schemeId, usesContractNumber, transaction) => {
  const agreementKey = usesContractNumber ? 'contractNumber' : 'agreementNumber'

  await db.payments.destroy({
    where: {
      [db.sequelize.Op.and]: [
        db.sequelize.where(db.sequelize.json(`data.${agreementKey}`), agreementNumber),
        db.sequelize.where(db.sequelize.json('data.frn'), frn),
        db.sequelize.where(db.sequelize.json('data.schemeId'), schemeId)
      ]
    },
    transaction
  })
}

module.exports = {
  removePayments
}

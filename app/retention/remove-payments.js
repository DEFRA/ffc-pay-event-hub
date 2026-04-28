const db = require('../data')

const removePayments = async (agreementNumber, frn, schemeId, usesContractNumber, transaction) => {
  const agreementKey = usesContractNumber ? 'contractNumber' : 'agreementNumber'

  await db.payments.destroy({
    where: {
      [db.Sequelize.Op.and]: [
        db.Sequelize.where(db.sequelize.json(`data.${agreementKey}`), agreementNumber),
        db.Sequelize.where(db.Sequelize.literal('(data->>\'frn\')::int'), Number(frn)),
        db.Sequelize.where(db.Sequelize.literal('(data->>\'schemeId\')::int'), Number(schemeId))
      ]
    },
    transaction
  })
}

module.exports = {
  removePayments
}

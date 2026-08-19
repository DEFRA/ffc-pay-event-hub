const db = require('../data')
const { MANUAL } = require('../constants/schemes')

const removePayments = async (agreementNumber, frn, schemeId, usesContractNumber, pillar, transaction) => {
  const agreementKey = usesContractNumber ? 'contractNumber' : 'agreementNumber'

  const conditions = [
    db.Sequelize.where(db.sequelize.json(`data.${agreementKey}`), agreementNumber),
    db.Sequelize.where(db.Sequelize.literal('(data->>\'frn\')::int'), Number(frn)),
    db.Sequelize.where(db.Sequelize.literal('(data->>\'schemeId\')::int'), Number(schemeId))
  ]

  if (schemeId === MANUAL && pillar) {
    conditions.push(db.Sequelize.where(db.sequelize.json('data.pillar'), pillar))
  }

  await db.payments.destroy({
    where: {
      [db.Sequelize.Op.and]: conditions
    },
    transaction
  })
}

module.exports = {
  removePayments
}

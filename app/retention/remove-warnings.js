const db = require('../data')

const removeWarnings = async (agreementNumber, frn, schemeId, usesContractNumber, transaction) => {
  const agreementField = usesContractNumber ? 'data.contractNumber' : 'data.agreementNumber'

  await db.warnings.destroy({
    where: {
      [db.sequelize.Op.and]: [
        { [agreementField]: agreementNumber },
        { 'data.frn': frn },
        { 'data.schemeId': schemeId }
      ]
    },
    transaction
  })
}

module.exports = {
  removeWarnings
}

const db = require('../data')

const removeWarnings = async (agreementNumber, frn, schemeId, transaction) => {
  await db.warnings.destroy({
    where: {
      [db.sequelize.Op.and]: [
        { 'data.agreementNumber': agreementNumber },
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

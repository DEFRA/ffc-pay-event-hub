const db = require('../data')

const removePayments = async (agreementNumber, frn, schemeId, transaction) => {
  await db.payments.destroy({
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
  removePayments
}

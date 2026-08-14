const db = require('../data')

const removePayments = async (
  agreementNumber,
  frn,
  schemeId,
  usesContractNumber,
  transaction
) => {
  const agreementKey = usesContractNumber
    ? 'contractNumber'
    : 'agreementNumber'

  const where = {
    [db.Sequelize.Op.and]: [
      db.Sequelize.where(
        db.sequelize.json(`data.${agreementKey}`),
        agreementNumber
      ),
      db.Sequelize.where(
        db.Sequelize.literal("(data->>'frn')::int"),
        Number(frn)
      ),
      db.Sequelize.where(
        db.Sequelize.literal("(data->>'schemeId')::int"),
        Number(schemeId)
      )
    ]
  }

  let batches = []
  let agreementNumbers = []
  let correlationIds = []

  if (usesContractNumber) {
    const paymentsToDelete = await db.payments.findAll({
      attributes: [
        [db.Sequelize.literal("data->>'batch'"), 'batch'],
        [
          db.Sequelize.literal("data->>'agreementNumber'"),
          'agreementNumber'
        ],
        [
          db.Sequelize.literal("data->>'correlationId'"),
          'correlationId'
        ]
      ],
      where,
      raw: true,
      transaction
    })

    batches = [
      ...new Set(
        paymentsToDelete
          .map(payment => payment.batch)
          .filter(Boolean)
      )
    ]

    agreementNumbers = [
      ...new Set(
        paymentsToDelete
          .map(payment => payment.agreementNumber)
          .filter(Boolean)
      )
    ]

    correlationIds = [
      ...new Set(
        paymentsToDelete
          .map(payment => payment.correlationId)
          .filter(Boolean)
      )
    ]
  }

  await db.payments.destroy({
    where,
    transaction
  })

  return {
    batches,
    agreementNumbers,
    correlationIds
  }
}

module.exports = {
  removePayments
}

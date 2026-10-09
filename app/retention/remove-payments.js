const { getSchemeIds } = require('ffc-pay-schemes')
const db = require('../database')
const { MANUAL } = getSchemeIds()

const removePayments = async (agreementNumber, frn, schemeId, usesContractNumber, pillar, transaction) => {
  const agreementKey = usesContractNumber ? 'contractNumber' : 'agreementNumber'

  const applyConditions = (query) => {
    query
      .whereRaw(`"data" #>> '{${agreementKey}}' = ?`, [agreementNumber])
      .whereRaw("(data->>'frn')::int = ?", [Number(frn)])
      .whereRaw("(data->>'schemeId')::int = ?", [Number(schemeId)])

    if (schemeId === MANUAL && pillar) {
      query.whereRaw('"data" #>> \'{pillar}\' = ?', [pillar])
    }
  }

  let batches = []
  let agreementNumbers = []
  let correlationIds = []

  if (usesContractNumber) {
    const paymentsToDelete = await db.payments(transaction ?? undefined)
      .select(
        db.client.raw("data->>'batch' AS \"batch\""),
        db.client.raw("data->>'agreementNumber' AS \"agreementNumber\""),
        db.client.raw("data->>'correlationId' AS \"correlationId\"")
      )
      .modify(applyConditions)

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

  await db.payments(transaction ?? undefined)
    .modify(applyConditions)
    .del()

  return {
    batches,
    agreementNumbers,
    correlationIds
  }
}

module.exports = {
  removePayments
}

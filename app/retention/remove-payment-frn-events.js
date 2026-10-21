const { paymentFrnEvents } = require('../database')

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
    await paymentFrnEvents(transaction ?? undefined)
      .whereIn('correlationId', correlationIds)
      .whereIn('agreementNumber', agreementNumbers)
      .where({ frn, schemeId })
      .del()

    return
  }

  await paymentFrnEvents(transaction ?? undefined)
    .where({
      agreementNumber,
      frn,
      schemeId
    })
    .del()
}

module.exports = {
  removePaymentFRNEvents
}

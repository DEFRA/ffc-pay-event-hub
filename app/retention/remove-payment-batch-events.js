const { paymentBatchEvents } = require('../database')

const removePaymentBatchEvents = async (
  agreementNumber,
  frn,
  schemeId,
  usesContractNumber,
  batches,
  agreementNumbers,
  transaction
) => {
  if (usesContractNumber) {
    if (!batches.length || !agreementNumbers.length) {
      return
    }

    await paymentBatchEvents(transaction ?? undefined)
      .whereIn('batchName', batches)
      .whereIn('agreementNumber', agreementNumbers)
      .where({ frn, schemeId })
      .del()

    return
  }

  await paymentBatchEvents(transaction ?? undefined)
    .where({
      agreementNumber,
      frn,
      schemeId
    })
    .del()
}

module.exports = {
  removePaymentBatchEvents
}

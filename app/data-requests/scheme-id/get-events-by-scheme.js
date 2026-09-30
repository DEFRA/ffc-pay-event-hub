const { schemePaymentTotals } = require('../../database')
const { sanitiseSchemeData } = require('./sanitise-scheme-data')

const getEventsByScheme = async (schemeId) => {
  const where = schemeId ? { schemeId } : {}

  const rawSchemeData = await schemePaymentTotals()
    .select('schemeId', 'paymentRequests', 'value')
    .where(where)

  const schemeData = rawSchemeData.map((event) => ({
    schemeId: event.schemeId,
    paymentRequests: Number(event.paymentRequests),
    value: event.value
  }))

  return sanitiseSchemeData(schemeData)
}

module.exports = {
  getEventsByScheme
}

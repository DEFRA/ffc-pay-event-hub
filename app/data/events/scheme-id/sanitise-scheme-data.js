const schemeNames = require('../../../constants/scheme-names')
const { convertToString } = require('../../../currency')

const sanitiseSchemeData = (schemeData) => {
  return schemeData.map(scheme => ({
    scheme: schemeNames[scheme.schemeId],
    paymentRequests: scheme.paymentRequests,
    value: convertToString(scheme.value)
  }))
}

module.exports = {
  sanitiseSchemeData
}

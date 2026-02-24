const schemeNames = require('../../constants/scheme-names')

const sanitiseSchemeData = (schemeData) => {
  return schemeData.map((scheme) => {
    const schemeName = schemeNames[scheme.schemeId]
    if (!schemeName) {
      throw new Error(`Unknown schemeId: ${scheme.schemeId}`)
    }
    return {
      scheme: schemeName,
      paymentRequests: scheme.paymentRequests,
      value: scheme.value,
    }
  })
}

module.exports = {
  sanitiseSchemeData,
}

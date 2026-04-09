const accountingValueSchemes = require('../../constants/accounting-value-schemes')
const schemeNames = require('../../constants/scheme-names')

const showNonAccountingValue = (value) => {
  const amount = parseFloat(value.replace('£', ''))
  const flipped = -amount
  return `£${flipped}`
}

const sanitiseSchemeData = (schemeData) => {
  return schemeData.map((scheme) => {
    const schemeName = schemeNames[scheme.schemeId]
    if (!schemeName) {
      throw new Error(`Unknown schemeId: ${scheme.schemeId}`)
    }
    const schemeProvidesAccountingValues = accountingValueSchemes.includes(Number(scheme.schemeId))
    console.log(scheme)
    return {
      scheme: schemeName,
      paymentRequests: scheme.paymentRequests,
      value: schemeProvidesAccountingValues ? showNonAccountingValue(scheme.value) : scheme.value
    }
  })
}

module.exports = {
  sanitiseSchemeData
}

const accountingValueSchemes = require('../../constants/accounting-value-schemes')
const schemeNames = require('../../constants/scheme-names')

const showNonAccountingValue = (value) => {
  const cleaned = value.replaceAll(/[£,]/g, '')
  const amount = Number.parseFloat(cleaned)
  const flipped = -amount
  return `£${flipped.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const sanitiseSchemeData = (schemeData) => {
  return schemeData.map((scheme) => {
    const schemeName = schemeNames[scheme.schemeId]
    if (!schemeName) {
      throw new Error(`Unknown schemeId: ${scheme.schemeId}`)
    }
    const schemeProvidesAccountingValues = accountingValueSchemes.includes(Number(scheme.schemeId))
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

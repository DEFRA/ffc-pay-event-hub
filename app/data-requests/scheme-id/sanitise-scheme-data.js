const { getSchemeNameFromSchemeId, schemeProvidesAccountingValues } = require('ffc-pay-schemes')

const showNonAccountingValue = (value) => {
  if (typeof value !== 'string') {
    return value
  }
  const cleaned = value.replaceAll(/[£,]/g, '')
  const amount = Number.parseFloat(cleaned)
  const flipped = amount === 0 ? amount : -amount
  return `£${flipped.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const sanitiseSchemeData = (schemeData) => {
  return schemeData.map((scheme) => {
    const schemeName = getSchemeNameFromSchemeId(scheme.schemeId)
    if (!schemeName) {
      throw new Error(`Unknown schemeId: ${scheme.schemeId}`)
    }
    const providesAccountingValues = schemeProvidesAccountingValues(Number(scheme.schemeId))
    return {
      scheme: schemeName,
      paymentRequests: scheme.paymentRequests,
      value: providesAccountingValues ? showNonAccountingValue(scheme.value) : scheme.value
    }
  })
}

module.exports = {
  sanitiseSchemeData
}

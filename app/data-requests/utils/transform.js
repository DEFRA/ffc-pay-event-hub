const eventDetails = require('../../constants/event-details')
const schemeNames = require('../../constants/scheme-names')
const { convertToString } = require('../../currency')

const copyNonExcludedKeys = (source, excludedKeys) => {
  return Object.keys(source).reduce((acc, key) => {
    if (!excludedKeys.has(key)) {
      acc[key] = source[key]
    }
    return acc
  }, {})
}

const mapCommonFields = (row, target) => {
  if (row.schemeId) {
    target.scheme = schemeNames[row.schemeId]
  }

  if (row.type) {
    target.status = eventDetails[row.type] || 'UNKNOWN'
  }

  if (row.originalValue) {
    target.originalValueText = convertToString(row.originalValue)
  }
}

module.exports = {
  copyNonExcludedKeys,
  mapCommonFields
}

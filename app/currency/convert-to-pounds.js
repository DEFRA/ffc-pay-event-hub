const convertToPounds = (valueInPence) => {
  return valueInPence ? (valueInPence / 100).toFixed(2) : undefined
}

module.exports = {
  convertToPounds
}

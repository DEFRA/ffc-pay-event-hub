const convertToString = (valueInPence) => {
  if (!valueInPence) {
    return '£0.00'
  }

  const pounds = valueInPence / 100
  const isNegative = pounds < 0
  const absPounds = Math.abs(pounds)

  const formatted = absPounds.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  return isNegative ? `£-${formatted}` : `£${formatted}`
}

module.exports = { convertToString }

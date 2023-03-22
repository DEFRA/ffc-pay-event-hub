const WARNING_IDENTIFIER = '.warning.'

const getWarningType = (eventType) => {
  return eventType.split(WARNING_IDENTIFIER)[1]
}

module.exports = {
  getWarningType
}

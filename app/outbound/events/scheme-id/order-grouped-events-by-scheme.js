const orderGroupedEventsByScheme = (events) => {
  return events.sort((a, b) => a.schemeId - b.schemeId)
}

module.exports = {
  orderGroupedEventsByScheme
}

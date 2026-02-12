const getTotalSchemeValues = (groupedEvents) => {
  return groupedEvents.map((eventsByScheme) => {
    const value = eventsByScheme.events.reduce((total, current) => {
      total += current.data.value
      return total
    }, 0)
    return {
      schemeId: eventsByScheme.schemeId,
      paymentRequests: eventsByScheme.events.length,
      value
    }
  })
}

module.exports = {
  getTotalSchemeValues
}

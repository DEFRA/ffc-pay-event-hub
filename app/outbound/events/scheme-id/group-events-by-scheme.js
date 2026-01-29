const groupEventsByScheme = (events) => {
  return [
    ...events
      .reduce((map, event) => {
        const key = event.PartitionKey

        const item = map.get(key) || {
          schemeId: key,
          events: [],
        }

        item.events.push(event)
        return map.set(key, item)
      }, new Map())
      .values(),
  ]
}

module.exports = {
  groupEventsByScheme,
}

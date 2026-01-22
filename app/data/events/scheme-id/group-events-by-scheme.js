const groupEventsByScheme = (events) => {
  return [...events.reduce((x, y) => {
    const key = y.partitionKey

    const item = x.get(key) || {
      ...{
        schemeId: y.partitionKey,
        events: []
      }
    }
    item.events.push(y)

    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = {
  groupEventsByScheme
}

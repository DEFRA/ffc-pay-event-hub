const { FC } = require('../../constants/schemes')
const { convertToString } = require('../../currency')

const addValues = (events) => {
  return events.map(event => {
    let originalValue = event.events[0]?.data.value
    // FC does not have a top level PR value after batch processing, only after enrichment. This allows us to catch the enrichment value
    if (event.events[0]?.data.schemeId === FC && !originalValue) {
      originalValue = event.events[1]?.data.value
    }

    return {
      ...event,
      originalValue,
      originalValueText: convertToString(originalValue),
      currentValue: event.events[event.events.length - 1]?.data.value,
      currentValueText: convertToString(event.events[event.events.length - 1]?.data.value)
    }
  })
}

module.exports = {
  addValues
}

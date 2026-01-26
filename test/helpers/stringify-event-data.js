const stringifyEventData = (event) => {
  event.data = JSON.stringify(event.data)
}

module.exports = {
  stringifyEventData
}

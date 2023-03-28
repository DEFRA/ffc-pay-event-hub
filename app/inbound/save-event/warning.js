const { WARNING } = require('../../constants/categories')
const { WARNING_EVENT } = require('../../constants/event-types')
const { getClient } = require('../../storage')
const { createRow } = require('./create-row')
const { getWarningType } = require('./get-warning-type')

const saveWarningEvent = async (event) => {
  const entity = createRow(getWarningType(event.type), event.id, WARNING, event)

  const client = getClient(WARNING_EVENT)
  await client.createEntity(entity)
}

module.exports = {
  saveWarningEvent
}


const { FRN, SCHEME_ID } = require('../../constants/categories')
const { HOLD_EVENT } = require('../../constants/event-types')
const { getClient } = require('../../storage')
const { createEntity } = require('./create-entity')

const saveHoldEvent = async (event) => {
  const frnBasedEntity = createEntity(event.data.frn, event.data.schemeId, FRN, event)
  const schemeIdBasedEntity = createEntity(event.data.schemeId, event.data.frn, SCHEME_ID, event)

  const client = getClient(HOLD_EVENT)
  await client.createEntity(frnBasedEntity)
  await client.createEntity(schemeIdBasedEntity)
}

module.exports = {
  saveHoldEvent
}


const { FRN, SCHEME_ID } = require('../../constants/categories')
const { HOLD_EVENT } = require('../../constants/event-types')
const { getClient } = require('../../storage')
const { createRow } = require('./create-row')

const saveHoldEvent = async (event) => {
  const frnBasedEntity = createRow(event.data.frn, event.data.schemeId, FRN, event)
  const schemeIdBasedEntity = createRow(event.data.schemeId, event.data.frn, SCHEME_ID, event)
  const holdCategoryIdBasedEntity = createRow(event.data.holdCategoryId, event.data.frn, SCHEME_ID, event)

  const client = getClient(HOLD_EVENT)
  await client.createEntity(frnBasedEntity)
  await client.createEntity(schemeIdBasedEntity)
  await client.createEntity(holdCategoryIdBasedEntity)
}

module.exports = {
  saveHoldEvent
}

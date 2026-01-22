const { getClient, odata } = require('../../storage')
const { PAYMENT_EVENT } = require('../../constants/event-types')

const getEvents = async (partitionKey, category) => {
  const client = getClient(PAYMENT_EVENT)
  const eventResults = client.listEntities({ queryOptions: { filter: odata`PartitionKey eq ${partitionKey.toString()} and category eq '${category}'` } })
  const events = []
  for await (const event of eventResults) {
    event.data = JSON.parse(event.data)
    events.push(event)
  }
  return events
}

module.exports = {
  getEvents
}

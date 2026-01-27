const { getClient, odata } = require('../../../storage')
const { PAYMENT_EVENT } = require('../../../constants/event-types')
const { PAYMENT_SUBMITTED } = require('../../../constants/events')

const getSubmittedEvents = async (partitionKey, category) => {
  const client = getClient(PAYMENT_EVENT)
  console.log(`category eq '${category}' and type eq '${PAYMENT_SUBMITTED}'`)
  let filter = odata`category eq '${category}' and type eq '${PAYMENT_SUBMITTED}'`
  if (partitionKey) {
    filter = odata`PartitionKey eq '${partitionKey.toString()}' and category eq '${category}' and type eq '${PAYMENT_SUBMITTED}'`
    console.log(`PartitionKey eq '${partitionKey.toString()}' and category eq '${category}' and type eq '${PAYMENT_SUBMITTED}'`)
  }
  const eventResults = client.listEntities({ queryOptions: { filter } })
  const events = []
  for await (const event of eventResults) {
    event.data = JSON.parse(event.data)
    events.push(event)
  }
  return events
}

module.exports = {
  getSubmittedEvents
}

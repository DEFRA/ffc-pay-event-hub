const { db } = require('../../../data')
const { PAYMENT_SUBMITTED } = require('../../../constants/events')

const getSubmittedEvents = async (id, category) => {
  const where = {
    category,
    type: PAYMENT_SUBMITTED
  }
  if (id) {
    where.PartitionKey = id
  }

  const events = await db.payments.findAll({
    where,
    order: [['Timestamp', 'ASC']]
  })

  return events.map(event => ({
    ...event.toJSON(),
    data: event.data ? JSON.parse(event.data) : undefined
  }))
}

module.exports = {
  getSubmittedEvents
}

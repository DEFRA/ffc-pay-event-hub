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

  return events.map(event => {
    let parsedData
    try {
      parsedData = event.data
        ? typeof event.data === 'string'
          ? JSON.parse(event.data)
          : event.data
        : undefined
    } catch (err) {
      parsedData = undefined
    }

    return {
      ...event.toJSON(),
      data: parsedData
    }
  })
}

module.exports = {
  getSubmittedEvents
}

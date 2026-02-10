const db = require('../../../data')
const { PAYMENT_SUBMITTED } = require('../../../constants/events')

const getSubmittedEvents = async (id, category) => {
  const where = {
    category,
    type: PAYMENT_SUBMITTED,
  }
  if (id) {
    where.partitionKey = id
  }

  const events = await db.payments.findAll({
    where,
    order: [['timestamp', 'ASC']],
  })

  return events.map((event) => {
    let parsedData
    try {
      const rawData = event.data
      if (rawData) {
        parsedData =
          typeof rawData === 'string' ? JSON.parse(rawData) : rawData
      } else {
        parsedData = null
      }
    } catch {
      parsedData = null
    }

    return {
      ...event.toJSON(),
      data: parsedData,
    }
  })
}

module.exports = {
  getSubmittedEvents,
}

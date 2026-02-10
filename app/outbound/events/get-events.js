const db = require('../../data')

const getEvents = async (id, category) => {
  const events = await db.payments.findAll({
    where: {
      partitionKey: id,
      category,
    },
    order: [['timestamp', 'ASC']],
  })

  return events.map((event) => ({
    ...event.toJSON(),
    data: event.data ? JSON.parse(event.data) : undefined,
  }))
}

module.exports = {
  getEvents,
}

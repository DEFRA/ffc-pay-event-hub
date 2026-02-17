const db = require('../../data')

const getEvents = async (id, category) => {
  const events = await db.payments.findAll({
    where: {
      partitionKey: id,
      category,
    },
    order: [['timestamp', 'ASC']],
  })

  return events.map((event) => {
    const raw = event.data

    let parsed

    if (!raw) {
      parsed = null
    } else if (typeof raw === 'string') {
      parsed = JSON.parse(raw)
    } else {
      parsed = raw
    }

    return {
      ...event.toJSON(),
      data: parsed,
    }
  })
}

module.exports = {
  getEvents,
}

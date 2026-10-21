const { payments } = require('../../../database')
const TABLE_COLUMNS = require('../../../constants/table-columns')

const getEvents = async (id, category) => {
  const events = await payments()
    .select(TABLE_COLUMNS.payments)
    .where({
      partitionKey: id,
      category
    })
    .orderBy('timestamp', 'asc')

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
      ...event,
      data: parsed
    }
  })
}

module.exports = {
  getEvents
}

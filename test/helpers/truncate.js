const db = require('../../app/database')

const tables = [
  'batches',
  'holds',
  'payment_batch_events',
  'payment_frn_events',
  'payments',
  'warnings'
]

const truncate = async () => {
  const quoted = tables.map(table => `"${table}"`).join(', ')
  await db.client.raw(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`)
}

module.exports = {
  truncate
}

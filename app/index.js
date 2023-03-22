require('./insights').setup()
require('log-timestamp')
const { start, stop } = require('./messaging')
const { initialiseTable } = require('./storage')

process.on(['SIGTERM', 'SIGINT'], async () => {
  await stop()
  process.exit(0)
})

module.exports = (async () => {
  await initialiseTable()
  await start()
})()

require('./insights').setup()
require('log-timestamp')
const { start, stop } = require('./messaging')

process.on(['SIGTERM', 'SIGINT', 'SIGKILL'], async () => {
  await stop()
  process.exit(0)
})

module.exports = (async () => {
  await start()
})()

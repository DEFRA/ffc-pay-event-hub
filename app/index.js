require('./insights').setup()
require('log-timestamp')

const { initialise } = require('./storage')
const { start, stop } = require('./messaging')
const { start: startCache, stop: stopCache } = require('./cache')

process.on(['SIGTERM', 'SIGINT'], async () => {
  await stopCache()
  await stop()
  process.exit(0)
})

module.exports = (async () => {
  await startCache()
  await initialise()
  await start()
})()

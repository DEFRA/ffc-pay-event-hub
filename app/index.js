require('./insights').setup()
require('log-timestamp')

const config = require('./config')
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

  if (config.processingActive) {
    await initialise()
    await start()
  }
})()

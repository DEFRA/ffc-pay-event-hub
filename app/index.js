require('./insights').setup()
require('log-timestamp')

const config = require('./config')
const storage = require('./storage')
const server = require('./server/server')
const messaging = require('./messaging')
const cache = require('./cache')

const shutdown = async () => {
  await cache.stopCache()
  await messaging.stop()
  process.exit(0)
}

process.on(['SIGTERM', 'SIGINT'], shutdown)

const startApp = async () => {
  await server.start()

  if (!config.processingActive) {
    console.info('Processing capabilities are currently not enabled in this environment')
    return
  }

  await cache.start()
  await messaging.start()
  await storage.initialiseContainers()
}

module.exports = (async () => {
  await startApp()
})()

const { createClient } = require('redis')
const { cacheConfig } = require('../config')

let client

const start = async () => {
  client = createClient({ socket: cacheConfig.socket, password: cacheConfig.password })
  client.on('error', (err) => console.log(`Redis error: ${err}`))
  client.on('reconnecting', () => console.log('Redis reconnecting...'))
  client.on('ready', () => console.log('Redis connected'))
  await client.connect()
}

const stop = async () => {
  await client.disconnect()
}

const getClient = () => client

module.exports = {
  start,
  stop,
  getClient
}

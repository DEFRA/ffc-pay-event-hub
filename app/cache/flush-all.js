const { getClient } = require('./base')

const flushAll = async () => {
  const client = getClient()
  await client.flushAll()
}

module.exports = {
  flushAll
}

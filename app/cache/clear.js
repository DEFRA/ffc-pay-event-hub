const { getFullKey } = require('./get-full-key')
const { getClient } = require('./base')

const clear = async (cache, key) => {
  const fullKey = getFullKey(cache, key)
  const client = getClient()
  await client.del(fullKey)
}

module.exports = {
  clear
}

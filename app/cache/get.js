const { getFullKey } = require('./get-full-key')
const { getClient } = require('./base')

const get = async (cache, key) => {
  const fullKey = getFullKey(cache, key)
  const client = getClient()
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
=======

>>>>>>> Stashed changes
  const value = await client.get(fullKey)
  return value ? JSON.parse(value) : {}
}

module.exports = {
  get
}

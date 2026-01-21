const hoek = require('@hapi/hoek')
const { get } = require('./get')
const { set } = require('./set')

const update = async (cache, key, cacheData) => {
  const existing = await get(cache, key)
  hoek.merge(existing, cacheData, { mergeArrays: false })
  await set(cache, key, existing)
}

module.exports = {
  update
}

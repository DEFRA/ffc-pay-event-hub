const { start, stop } = require('./base')
const { getCachedResponse } = require('./get-cached-response')
const { setCachedResponse } = require('./set-cached-response')
const { getCacheKey } = require('./get-cache-key')

module.exports = {
  start,
  stop,
  getCachedResponse,
  setCachedResponse,
  getCacheKey
}

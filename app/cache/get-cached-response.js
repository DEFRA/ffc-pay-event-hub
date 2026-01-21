const { isDeepStrictEqual } = require('util')
const { get } = require('./get')
const { update } = require('./update')
const { getRequestIndex } = require('./get-request-index')

const getCachedResponse = async (cache, request, key) => {
  const cacheData = await get(cache, key)

  // ensure an array for all session requests created
  if (!cacheData.requests) {
    cacheData.requests = []
  }

  // if request is unique, add to cache
  if (!cacheData.requests.some(x => isDeepStrictEqual(x.request, request))) {
    cacheData.requests.push({ request })
    await update(cache, key, cacheData)
  }

  // find cache entry for request
  const requestIndex = getRequestIndex(cacheData, request)

  const response = cacheData.requests[requestIndex]?.response
  console.log(response ? 'Using cached value' : 'No cached value available')
  return response
}

module.exports = {
  getCachedResponse
}

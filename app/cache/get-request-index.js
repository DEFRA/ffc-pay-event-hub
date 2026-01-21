const { isDeepStrictEqual } = require('util')

const getRequestIndex = (cacheData, request) => {
  return cacheData.requests.findIndex(x => isDeepStrictEqual(x.request, request))
}

module.exports = {
  getRequestIndex
}

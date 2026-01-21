const { cacheConfig } = require('../config')

const getKeyPrefix = (cache) => {
  return `${cacheConfig.partition}:${cache}`
}

module.exports = {
  getKeyPrefix
}

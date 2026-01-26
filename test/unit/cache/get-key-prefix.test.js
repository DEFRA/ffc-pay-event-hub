const { NAME } = require('../../mocks/cache/name')

const { cacheConfig } = require('../../../app/config')

const { getKeyPrefix } = require('../../../app/cache/get-key-prefix')

describe('get key prefix', () => {
  test('should return prefix from cache name', () => {
    const prefix = getKeyPrefix(NAME)
    expect(prefix).toEqual(`${cacheConfig.partition}:${NAME}`)
  })
})

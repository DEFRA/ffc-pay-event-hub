const { CATEGORY } = require('../../mocks/values/category')
const { REQUEST_VALUE } = require('../../mocks/cache/request-value')

const { getCacheKey } = require('../../../app/cache/get-cache-key')

describe('get cache key', () => {
  test('should return cache key', () => {
    const key = getCacheKey(CATEGORY, REQUEST_VALUE)
    expect(key).toEqual(`${CATEGORY}:${REQUEST_VALUE}`)
  })
})

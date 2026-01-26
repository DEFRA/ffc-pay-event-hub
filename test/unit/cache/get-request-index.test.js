const { DATA } = require('../../mocks/cache/data')
const { REQUEST } = require('../../mocks/request')

const { getRequestIndex } = require('../../../app/cache/get-request-index')

describe('get request index', () => {
  test('returns index of request', () => {
    expect(getRequestIndex(DATA, REQUEST)).toBe(0)
  })

  test('returns -1 if request not found', () => {
    expect(getRequestIndex(DATA, { a: 1 })).toBe(-1)
  })
})

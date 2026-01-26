jest.mock('../../../app/cache/get')
const { get: mockGet } = require('../../../app/cache/get')

jest.mock('../../../app/cache/set')
const { set: mockSet } = require('../../../app/cache/set')

const { NAME } = require('../../mocks/cache/name')
const { KEY } = require('../../mocks/cache/key')
const { VALUE } = require('../../mocks/cache/value')

const { update } = require('../../../app/cache/update')

describe('cache update', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({})
  })

  test('should get existing item and set new value', async () => {
    await update(NAME, KEY, VALUE)
    expect(mockGet).toHaveBeenCalledWith(NAME, KEY)
    expect(mockSet).toHaveBeenCalledWith(NAME, KEY, VALUE)
  })

  test('should merge existing object with new value', async () => {
    mockGet.mockResolvedValue({ a: 1, b: 2 })
    await update(NAME, KEY, VALUE)
    expect(mockSet).toHaveBeenCalledWith(NAME, KEY, { a: 1, b: 2, ...VALUE })
  })

  test('should replace arrays instead of merging', async () => {
    mockGet.mockResolvedValue({ a: [1, 2, 3] })
    await update(NAME, KEY, { a: [4, 5, 6] })
    expect(mockSet).toHaveBeenCalledWith(NAME, KEY, { a: [4, 5, 6] })
  })
})

const { getTimestamp } = require('../../../../app/inbound/save-event/get-timestamp')

describe('get timestamp', () => {
  test('returns timestamp from time', () => {
    const timestamp = getTimestamp('2019-10-10T10:10:10.000Z')
    expect(timestamp).toBe(1570702210000)
  })
})

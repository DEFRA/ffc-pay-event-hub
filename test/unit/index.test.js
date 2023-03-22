jest.mock('../../app/messaging')
const mockMessaging = require('../../app/messaging')
jest.mock('../../app/storage')
const mockStorage = require('../../app/storage')

describe('app', () => {
  beforeEach(() => {
    require('../../app')
  })

  test('starts messaging', async () => {
    expect(mockMessaging.start).toHaveBeenCalled()
  })

  test('initialises tables', async () => {
    expect(mockStorage.initialiseTables).toHaveBeenCalled()
  })
})

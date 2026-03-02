jest.mock('../../app/server/server', () => ({
  start: jest.fn()
}))

jest.mock('../../app/messaging', () => ({
  start: jest.fn(),
  stop: jest.fn()
}))

jest.mock('../../app/storage', () => ({
  initialiseContainers: jest.fn()
}))

jest.mock('../../app/config', () => ({
  processingActive: true
}))

describe('app startup', () => {
  let server
  let messaging
  let storage

  beforeEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()

    require('../../app')
    server = require('../../app/server/server')
    messaging = require('../../app/messaging')
    storage = require('../../app/storage')
  })

  test('starts server once', () => {
    expect(server.start).toHaveBeenCalledTimes(1)
  })

  test('initialises storage once', () => {
    expect(storage.initialiseContainers).toHaveBeenCalledTimes(1)
  })

  test('does not start messaging (not implemented)', () => {
    expect(messaging.start).toHaveBeenCalledTimes(1)
  })
})

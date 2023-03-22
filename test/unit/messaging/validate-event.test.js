const { VALIDATION } = require('../../../app/constants/errors')

jest.mock('../../../app/messaging/event-schema')
const mockSchema = require('../../../app/messaging/event-schema')

const event = require('../../mocks/event')

const { validateEvent } = require('../../../app/messaging/validate-event')

describe('validate event', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockSchema.validate.mockReturnValue({ error: undefined })
  })

  test('should not throw an error if the event is valid', () => {
    expect(() => validateEvent(event)).not.toThrow()
  })

  test('should throw an error if the event is invalid', () => {
    mockSchema.validate.mockReturnValue({ error: new Error('Event is invalid') })
    expect(() => validateEvent(event)).toThrow()
  })

  test('should throw an error with validation category if the event is invalid', () => {
    mockSchema.validate.mockReturnValue({ error: new Error('Event is invalid') })
    try {
      validateEvent(event)
    } catch (error) {
      expect(error.category).toBe(VALIDATION)
    }
  })
})

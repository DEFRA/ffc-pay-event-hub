jest.mock('../../../app/messaging/message-schema')
const mockSchema = require('../../../app/messaging/message-schema')

const { VALIDATION } = require('../../../app/constants/errors')

const { REQUEST_MESSAGE } = require('../../mocks/messaging/message')

const { validateMessage } = require('../../../app/messaging/validate-message')

describe('validate message', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockSchema.validate.mockReturnValue({ error: undefined })
  })

  test('should not throw an error if the event is valid', () => {
    expect(() => validateMessage(REQUEST_MESSAGE)).not.toThrow()
  })

  test('should throw an error if the event is invalid', () => {
    mockSchema.validate.mockReturnValue({ error: new Error('Event is invalid') })
    expect(() => validateMessage(REQUEST_MESSAGE)).toThrow()
  })

  test('should throw an error with validation category if the event is invalid', () => {
    mockSchema.validate.mockReturnValue({ error: new Error('Event is invalid') })
    try {
      validateMessage(REQUEST_MESSAGE)
    } catch (error) {
      expect(error.category).toBe(VALIDATION)
    }
  })
})

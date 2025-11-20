const { VALIDATION } = require('../../../app/constants/errors')
const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('../../../app/constants/event-types')

jest.mock('../../../app/inbound/schemas/payment')
jest.mock('../../../app/inbound/schemas/hold')
jest.mock('../../../app/inbound/schemas/warning')
jest.mock('../../../app/inbound/schemas/batch')

const mockSchemas = {
  [PAYMENT_EVENT]: require('../../../app/inbound/schemas/payment'),
  [HOLD_EVENT]: require('../../../app/inbound/schemas/hold'),
  [WARNING_EVENT]: require('../../../app/inbound/schemas/warning'),
  [BATCH_EVENT]: require('../../../app/inbound/schemas/batch')
}

const { validateEventData } = require('../../../app/inbound/validate-event-data')

const eventData = 'event data'

describe('validateEventData', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    Object.values(mockSchemas).forEach(schema => schema.validate.mockReturnValue({ error: undefined }))
  })

  Object.entries(mockSchemas).forEach(([eventType, schema]) => {
    test(`should validate with ${eventType} schema`, () => {
      validateEventData(eventData, eventType)
      expect(schema.validate).toHaveBeenCalledWith(eventData, expect.anything())
    })

    test(`should throw validation error for ${eventType} if schema fails`, () => {
      schema.validate.mockReturnValue({ error: 'validation error' })
      expect(() => validateEventData(eventData, eventType)).toThrow()
      try {
        validateEventData(eventData, eventType)
      } catch (err) {
        expect(err.category).toBe(VALIDATION)
      }
    })
  })
})

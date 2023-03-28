const { VALIDATION } = require('../../../app/constants/errors')
const { PAYMENT_EVENT, HOLD_EVENT, WARNING_EVENT, BATCH_EVENT } = require('../../../app/constants/event-types')

jest.mock('../../../app/inbound/schemas/payment')
const mockPaymentSchema = require('../../../app/inbound/schemas/payment')

jest.mock('../../../app/inbound/schemas/hold')
const mockHoldSchema = require('../../../app/inbound/schemas/hold')

jest.mock('../../../app/inbound/schemas/warning')
const mockWarningSchema = require('../../../app/inbound/schemas/warning')

jest.mock('../../../app/inbound/schemas/batch')
const mockBatchSchema = require('../../../app/inbound/schemas/batch')

const eventData = 'event data'

const { validateEventData } = require('../../../app/inbound/validate-event-data')

describe('validate event data', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockPaymentSchema.validate.mockReturnValue({ error: undefined })
    mockHoldSchema.validate.mockReturnValue({ error: undefined })
    mockWarningSchema.validate.mockReturnValue({ error: undefined })
    mockBatchSchema.validate.mockReturnValue({ error: undefined })
  })

  test('should validate with payment schema if payment event', () => {
    validateEventData(eventData, PAYMENT_EVENT)
    expect(mockPaymentSchema.validate).toHaveBeenCalledWith(eventData, expect.anything())
  })

  test('should validate with hold schema if hold event', () => {
    validateEventData(eventData, HOLD_EVENT)
    expect(mockHoldSchema.validate).toHaveBeenCalledWith(eventData, expect.anything())
  })

  test('should validate with warning schema if warning event', () => {
    validateEventData(eventData, WARNING_EVENT)
    expect(mockWarningSchema.validate).toHaveBeenCalledWith(eventData, expect.anything())
  })

  test('should validate with batch schema if batch event', () => {
    validateEventData(eventData, BATCH_EVENT)
    expect(mockBatchSchema.validate).toHaveBeenCalledWith(eventData, expect.anything())
  })

  test('should throw error if payment validation fails', () => {
    mockPaymentSchema.validate.mockReturnValue({ error: 'validation error' })
    expect(() => validateEventData(eventData, PAYMENT_EVENT)).toThrow()
  })

  test('should throw error with validation category if payment validation fails', () => {
    mockPaymentSchema.validate.mockReturnValue({ error: 'validation error' })
    try {
      validateEventData(eventData, PAYMENT_EVENT)
    } catch (err) {
      expect(err.category).toBe(VALIDATION)
    }
  })

  test('should throw error if hold validation fails', () => {
    mockHoldSchema.validate.mockReturnValue({ error: 'validation error' })
    expect(() => validateEventData(eventData, HOLD_EVENT)).toThrow()
  })

  test('should throw error with validation category if hold validation fails', () => {
    mockHoldSchema.validate.mockReturnValue({ error: 'validation error' })
    try {
      validateEventData(eventData, HOLD_EVENT)
    } catch (err) {
      expect(err.category).toBe(VALIDATION)
    }
  })

  test('should throw error if warning validation fails', () => {
    mockWarningSchema.validate.mockReturnValue({ error: 'validation error' })
    expect(() => validateEventData(eventData, WARNING_EVENT)).toThrow()
  })

  test('should throw error with validation category if warning validation fails', () => {
    mockWarningSchema.validate.mockReturnValue({ error: 'validation error' })
    try {
      validateEventData(eventData, WARNING_EVENT)
    } catch (err) {
      expect(err.category).toBe(VALIDATION)
    }
  })

  test('should throw error if batch validation fails', () => {
    mockBatchSchema.validate.mockReturnValue({ error: 'validation error' })
    expect(() => validateEventData(eventData, BATCH_EVENT)).toThrow()
  })

  test('should throw error with validation category if batch validation fails', () => {
    mockBatchSchema.validate.mockReturnValue({ error: 'validation error' })
    try {
      validateEventData(eventData, BATCH_EVENT)
    } catch (err) {
      expect(err.category).toBe(VALIDATION)
    }
  })
})

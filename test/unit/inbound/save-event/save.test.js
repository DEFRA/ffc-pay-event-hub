jest.mock('../../../../app/inbound/save-event/hold')
const { saveHoldEvent: mockSaveHoldEvent } = require('../../../../app/inbound/save-event/hold')

jest.mock('../../../../app/inbound/save-event/warning')
const { saveWarningEvent: mockSaveWarningEvent } = require('../../../../app/inbound/save-event/warning')

jest.mock('../../../../app/inbound/save-event/payment')
const { savePaymentEvent: mockSavePaymentEvent } = require('../../../../app/inbound/save-event/payment')

jest.mock('../../../../app/inbound/save-event/batch')
const { saveBatchEvent: mockSaveBatchEvent } = require('../../../../app/inbound/save-event/batch')

const { saveEvent } = require('../../../../app/inbound/save-event/save')

const event = require('../../../mocks/events/event')
const { HOLD_EVENT, WARNING_EVENT, PAYMENT_EVENT, BATCH_EVENT } = require('../../../../app/constants/event-types')

describe('save event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('saves hold event if hold', async () => {
    await saveEvent(event, HOLD_EVENT)
    expect(mockSaveHoldEvent).toHaveBeenCalledWith(event)
  })

  test('saves warning event if warning', async () => {
    await saveEvent(event, WARNING_EVENT)
    expect(mockSaveWarningEvent).toHaveBeenCalledWith(event)
  })

  test('saves payment event if payment', async () => {
    await saveEvent(event, PAYMENT_EVENT)
    expect(mockSavePaymentEvent).toHaveBeenCalledWith(event)
  })

  test('saves batch event if batch', async () => {
    await saveEvent(event, BATCH_EVENT)
    expect(mockSaveBatchEvent).toHaveBeenCalledWith(event)
  })

  test('throws error if unknown event type', async () => {
    await expect(saveEvent(event, 'unknown')).rejects.toThrow('Unknown event type: unknown')
  })
})

jest.mock('../../../../app/inbound/save-event/hold')
const { saveHoldEvent: mockSaveHoldEvent } = require('../../../../app/inbound/save-event/hold')

jest.mock('../../../../app/inbound/save-event/warning')
const { saveWarningEvent: mockSaveWarningEvent } = require('../../../../app/inbound/save-event/warning')

jest.mock('../../../../app/inbound/save-event/payment')
const { savePaymentEvent: mockSavePaymentEvent } = require('../../../../app/inbound/save-event/payment')

jest.mock('../../../../app/inbound/save-event/batch')
const { saveBatchEvent: mockSaveBatchEvent } = require('../../../../app/inbound/save-event/batch')

const { saveEvent } = require('../../../../app/inbound/save-event')
const event = require('../../../mocks/events/event')
const { HOLD_EVENT, WARNING_EVENT, PAYMENT_EVENT, BATCH_EVENT } = require('../../../../app/constants/event-types')

describe('save event', () => {
  beforeEach(() => jest.clearAllMocks())

  test.each([
    ['hold', HOLD_EVENT, mockSaveHoldEvent, event],
    ['warning', WARNING_EVENT, mockSaveWarningEvent, event],
    ['batch', BATCH_EVENT, mockSaveBatchEvent, event]
  ])('saves %s event', async (_, type, mockFn, evt) => {
    await saveEvent(evt, type)
    expect(mockFn).toHaveBeenCalledWith(evt)
  })

  test('saves payment event if frn exists', async () => {
    const frnEvent = { ...event, data: { frn: 1234567890 } }
    await saveEvent(frnEvent, PAYMENT_EVENT)
    expect(mockSavePaymentEvent).toHaveBeenCalledWith(frnEvent)
  })

  test('does not save payment event if frn missing', async () => {
    const frnlessEvent = { ...event }
    delete frnlessEvent.data.frn
    await saveEvent(frnlessEvent, PAYMENT_EVENT)
    expect(mockSavePaymentEvent).not.toHaveBeenCalled()
  })

  test('throws error for unknown event type', async () => {
    await expect(saveEvent(event, 'unknown')).rejects.toThrow('Unknown event type: unknown')
  })
})

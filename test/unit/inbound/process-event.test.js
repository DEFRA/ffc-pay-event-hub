jest.mock('../../../app/inbound/get-event-type')
const { getEventType: mockGetEventType } = require('../../../app/inbound/get-event-type')

jest.mock('../../../app/inbound/save-event')
const { saveEvent: mockSaveEvent } = require('../../../app/inbound/save-event')

jest.mock('../../../app/inbound/validate-event-data')
const { validateEventData: mockValidateEventData } = require('../../../app/inbound/validate-event-data')

jest.mock('../../../app/messaging/send-alert')
const { sendAlert: mockSendAlert } = require('../../../app/messaging/send-alert')

const event = require('../../mocks/events/event')

const { WARNING } = require('../../../app/constants/categories')

const { processEvent } = require('../../../app/inbound/process-event')

const MOCK_EVENT_TYPE = 'mock-event-type'

describe('process event', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockGetEventType.mockReturnValue(MOCK_EVENT_TYPE)
  })

  test('should get the event type from event type', async () => {
    await processEvent(event)
    expect(mockGetEventType).toHaveBeenCalledWith(event.type)
  })

  test('should validate event data with event type', async () => {
    await processEvent(event)
    expect(mockValidateEventData).toHaveBeenCalledWith(event.data, MOCK_EVENT_TYPE)
  })

  test('should save the event', async () => {
    await processEvent(event)
    expect(mockSaveEvent).toHaveBeenCalledWith(event, MOCK_EVENT_TYPE)
  })

  test('should send an alert if the event type is warning', async () => {
    mockGetEventType.mockReturnValue(WARNING)
    await processEvent(event)
    expect(mockSendAlert).toHaveBeenCalledWith(event)
  })

  test('should not send an alert if the event type is not warning', async () => {
    await processEvent(event)
    expect(mockSendAlert).not.toHaveBeenCalled()
  })

  test('should send an alert even if saveEvent fails', async () => {
    mockGetEventType.mockReturnValue(WARNING)
    mockSaveEvent.mockImplementationOnce(() => {
      throw new Error('saveEvent failed')
    })

    await expect(processEvent(event)).rejects.toThrow('saveEvent failed')
    expect(mockSendAlert).toHaveBeenCalledWith(event)
  })
})

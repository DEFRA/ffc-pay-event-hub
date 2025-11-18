jest.mock('../../../app/inbound/get-event-type')
jest.mock('../../../app/inbound/save-event')
jest.mock('../../../app/inbound/validate-event-data')
jest.mock('../../../app/messaging/send-alert')

const { getEventType: mockGetEventType } = require('../../../app/inbound/get-event-type')
const { saveEvent: mockSaveEvent } = require('../../../app/inbound/save-event')
const { validateEventData: mockValidateEventData } = require('../../../app/inbound/validate-event-data')
const { sendAlert: mockSendAlert } = require('../../../app/messaging/send-alert')

const { processEvent } = require('../../../app/inbound/process-event')
const event = require('../../mocks/events/event')
const { WARNING } = require('../../../app/constants/categories')

describe('processEvent', () => {
  const MOCK_EVENT_TYPE = 'mock-event-type'

  beforeEach(() => {
    jest.resetAllMocks()
    mockGetEventType.mockReturnValue(MOCK_EVENT_TYPE)
  })

  test('gets event type, validates data, and saves the event', async () => {
    await processEvent(event)
    expect(mockGetEventType).toHaveBeenCalledWith(event.type)
    expect(mockValidateEventData).toHaveBeenCalledWith(event.data, MOCK_EVENT_TYPE)
    expect(mockSaveEvent).toHaveBeenCalledWith(event, MOCK_EVENT_TYPE)
  })

  test('sends alert for warning events only', async () => {
    mockGetEventType.mockReturnValue(WARNING)
    await processEvent(event)
    expect(mockSendAlert).toHaveBeenCalledWith(event)
  })

  test('does not send alert for non-warning events', async () => {
    mockGetEventType.mockReturnValue(MOCK_EVENT_TYPE)
    await processEvent(event)
    expect(mockSendAlert).not.toHaveBeenCalled()
  })

  test('sends alert even if saveEvent fails', async () => {
    mockGetEventType.mockReturnValue(WARNING)
    mockSaveEvent.mockImplementationOnce(() => { throw new Error('saveEvent failed') })

    await expect(processEvent(event)).rejects.toThrow('saveEvent failed')
    expect(mockSendAlert).toHaveBeenCalledWith(event)
  })
})

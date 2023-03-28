jest.mock('../../../app/inbound/get-event-type')
const { getEventType: mockGetEventType } = require('../../../app/inbound/get-event-type')

jest.mock('../../../app/inbound/save-event')
const { saveEvent: mockSaveEvent } = require('../../../app/inbound/save-event')

jest.mock('../../../app/inbound/validate-event-data')
const { validateEventData: mockValidateEventData } = require('../../../app/inbound/validate-event-data')

const event = require('../../mocks/events/event')

const MOCK_EVENT_TYPE = 'mock-event-type'

const { processEvent } = require('../../../app/inbound/process-event')

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
})

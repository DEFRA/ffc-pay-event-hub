jest.mock('../../../app/inbound')
const { processEvent: mockProcessEvent } = require('../../../app/inbound')
const { processEventMessage } = require('../../../app/messaging/process-event-message')

const receiver = { completeMessage: jest.fn() }

let events = {}

beforeEach(() => {
  jest.clearAllMocks()
  events = {
    payment: structuredClone(require('../../mocks/events/payment')),
    hold: structuredClone(require('../../mocks/events/hold')),
    batch: structuredClone(require('../../mocks/events/batch')),
    warning: structuredClone(require('../../mocks/events/warning'))
  }
})

describe('process event message', () => {
  test.each([
    ['payment', 'payment'],
    ['hold', 'hold'],
    ['batch', 'batch'],
    ['warning', 'warning']
  ])('processes %s event', async (_, key) => {
    await processEventMessage({ body: events[key] }, receiver)
    expect(mockProcessEvent).toHaveBeenCalledWith(events[key])
  })
})

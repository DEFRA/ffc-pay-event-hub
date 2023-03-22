jest.mock('../../../app/inbound')
const { processEvent: mockProcessEvent } = require('../../../app/inbound')

const { processEventMessage } = require('../../../app/messaging/process-event-message')

const receiver = {
  completeMessage: jest.fn()
}

let paymentEvent
let holdEvent
let batchEvent
let warningEvent

beforeEach(() => {
  jest.clearAllMocks()
  paymentEvent = JSON.parse(JSON.stringify(require('../../mocks/payment-event')))
  holdEvent = JSON.parse(JSON.stringify(require('../../mocks/hold-event')))
  batchEvent = JSON.parse(JSON.stringify(require('../../mocks/batch-event')))
  warningEvent = JSON.parse(JSON.stringify(require('../../mocks/warning-event')))
})

describe('process event message', () => {
  test('processes payment event', async () => {
    await processEventMessage({ body: paymentEvent }, receiver)
    expect(mockProcessEvent).toHaveBeenCalledWith(paymentEvent)
  })

  test('processes hold event', async () => {
    await processEventMessage({ body: holdEvent }, receiver)
    expect(mockProcessEvent).toHaveBeenCalledWith(holdEvent)
  })

  test('processes batch event', async () => {
    await processEventMessage({ body: batchEvent }, receiver)
    expect(mockProcessEvent).toHaveBeenCalledWith(batchEvent)
  })

  test('processes warning event', async () => {
    await processEventMessage({ body: warningEvent }, receiver)
    expect(mockProcessEvent).toHaveBeenCalledWith(warningEvent)
  })
})

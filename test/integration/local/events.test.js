const { odata } = require('@azure/data-tables')
const { PAYMENT_EVENT, HOLD_EVENT, BATCH_EVENT, WARNING_EVENT } = require('../../../app/constants/event-types')
const { processEventMessage } = require('../../../app/messaging/process-event-message')
const { initialiseTables, getClient } = require('../../../app/storage')

const receiver = {
  completeMessage: jest.fn()
}

let paymentClient
let holdClient
let batchClient
let warningClient

let paymentEvent
let holdEvent
let batchEvent
let warningEvent

beforeAll(async () => {
  await initialiseTables()
  paymentClient = getClient(PAYMENT_EVENT)
  holdClient = getClient(HOLD_EVENT)
  batchClient = getClient(BATCH_EVENT)
  warningClient = getClient(WARNING_EVENT)
})

beforeEach(async () => {
  paymentClient.deleteTable()
  holdClient.deleteTable()
  batchClient.deleteTable()
  warningClient.deleteTable()

  paymentClient.createTable()
  holdClient.createTable()
  batchClient.createTable()
  warningClient.createTable()

  paymentEvent = JSON.parse(JSON.stringify(require('../../mocks/payment-event')))
  holdEvent = JSON.parse(JSON.stringify(require('../../mocks/hold-event')))
  batchEvent = JSON.parse(JSON.stringify(require('../../mocks/batch-event')))
  warningEvent = JSON.parse(JSON.stringify(require('../../mocks/warning-event')))
})

describe('process event message', () => {
  test('saves FRN payment event', async () => {
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.frn}` }
    })
    expect(results.length).toBe(1)
  })

  test('saves correlation id payment event', async () => {
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.correlationId}` }
    })
    expect(results.length).toBe(1)
  })

  test('saves scheme id payment event', async () => {
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.schemeId}` }
    })
    expect(results.length).toBe(1)
  })

  test('saves batch payment event', async () => {
    paymentEvent.data.batch = 'mock-batch'
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.batch}` }
    })
    expect(results.length).toBe(1)
  })
})

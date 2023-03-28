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

  paymentEvent = JSON.parse(JSON.stringify(require('../../mocks/events/payment')))
  holdEvent = JSON.parse(JSON.stringify(require('../../mocks/events/hold')))
  batchEvent = JSON.parse(JSON.stringify(require('../../mocks/events/batch')))
  warningEvent = JSON.parse(JSON.stringify(require('../../mocks/events/warning')))
})

const countAsyncIterator = async (iterator) => {
  let count = 0
  for await (const _ of iterator) { // eslint-disable-line no-unused-vars
    count++
  }
  return count
}

describe('process event message', () => {
  test('saves FRN payment event', async () => {
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.frn.toString()}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })

  test('saves correlation id payment event', async () => {
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.correlationId}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })

  test('saves scheme id payment event', async () => {
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.schemeId.toString()}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })

  test('saves batch payment event', async () => {
    paymentEvent.data.batch = 'mock-batch'
    await processEventMessage({ body: paymentEvent }, receiver)
    const results = paymentClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${paymentEvent.data.batch}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })

  test('saves FRN hold event', async () => {
    await processEventMessage({ body: holdEvent }, receiver)
    const results = holdClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${holdEvent.data.frn.toString()}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })

  test('saves scheme id hold event', async () => {
    await processEventMessage({ body: holdEvent }, receiver)
    const results = holdClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${holdEvent.data.schemeId.toString()}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })

  test('saves batch event', async () => {
    await processEventMessage({ body: batchEvent }, receiver)
    const results = batchClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${batchEvent.data.filename}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })

  test('saves warning event', async () => {
    await processEventMessage({ body: warningEvent }, receiver)
    const results = warningClient.listEntities({
      queryOptions: { filter: odata`PartitionKey eq ${'event'}` }
    })
    const total = await countAsyncIterator(results)
    expect(total).toBe(1)
  })
})

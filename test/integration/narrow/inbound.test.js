const { FRN, CORRELATION_ID, SCHEME_ID, BATCH } = require('../../../app/constants/categories')

const mockTableClient = {
  createTable: jest.fn(),
  createEntity: jest.fn()
}
jest.mock('@azure/data-tables', () => {
  return {
    TableClient: {
      fromConnectionString: jest.fn().mockReturnValue(mockTableClient)
    }
  }
})

const { initialiseTables } = require('../../../app/storage')

const { processEvent } = require('../../../app/inbound/process-event')

let paymentEvent
let holdEvent
let batchEvent
let warningEvent

beforeAll(async () => {
  await initialiseTables()
})

beforeEach(() => {
  jest.clearAllMocks()
  paymentEvent = JSON.parse(JSON.stringify(require('../../mocks/payment-event')))
  holdEvent = JSON.parse(JSON.stringify(require('../../mocks/hold-event')))
  batchEvent = JSON.parse(JSON.stringify(require('../../mocks/batch-event')))
  warningEvent = JSON.parse(JSON.stringify(require('../../mocks/warning-event')))
})

describe('inbound payment event', () => {
  test('saves three payment entities if no batch', async () => {
    await processEvent(paymentEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledTimes(3)
  })

  test('saves four payment entities if batch', async () => {
    paymentEvent.data.batch = 'mock-batch'
    await processEvent(paymentEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledTimes(4)
  })

  test('saves FRN payment entity', async () => {
    await processEvent(paymentEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: paymentEvent.data.frn.toString(),
      category: FRN
    }))
  })

  test('saves correlation id payment entity', async () => {
    await processEvent(paymentEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: paymentEvent.data.correlationId,
      category: CORRELATION_ID
    }))
  })

  test('saves scheme id payment entity', async () => {
    await processEvent(paymentEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: paymentEvent.data.schemeId.toString(),
      category: SCHEME_ID
    }))
  })

  test('saves batch payment entity if batch', async () => {
    paymentEvent.data.batch = 'mock-batch'
    await processEvent(paymentEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: paymentEvent.data.batch,
      category: BATCH
    }))
  })
})

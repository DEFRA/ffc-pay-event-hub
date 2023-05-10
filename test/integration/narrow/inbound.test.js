const mockSendMessage = jest.fn()

jest.mock('ffc-messaging', () => {
  return {
    MessageSender: jest.fn().mockImplementation(() => {
      return {
        sendMessage: mockSendMessage,
        closeConnection: jest.fn()
      }
    })
  }
})

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

const { FRN, CORRELATION_ID, SCHEME_ID, BATCH, WARNING } = require('../../../app/constants/categories')

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
  paymentEvent = JSON.parse(JSON.stringify(require('../../mocks/events/payment')))
  holdEvent = JSON.parse(JSON.stringify(require('../../mocks/events/hold')))
  batchEvent = JSON.parse(JSON.stringify(require('../../mocks/events/batch')))
  warningEvent = JSON.parse(JSON.stringify(require('../../mocks/events/warning')))
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

  test('does not send event for payment event', async () => {
    await processEvent(paymentEvent)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound hold event', () => {
  test('saves three hold entities', async () => {
    await processEvent(holdEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledTimes(3)
  })

  test('saves FRN hold entity', async () => {
    await processEvent(holdEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: holdEvent.data.frn.toString(),
      category: FRN
    }))
  })

  test('saves scheme id hold entity', async () => {
    await processEvent(holdEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: holdEvent.data.schemeId.toString(),
      category: SCHEME_ID
    }))
  })

  test('does not send alert for hold event', async () => {
    await processEvent(holdEvent)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound batch event', () => {
  test('saves one batch entity', async () => {
    await processEvent(batchEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledTimes(1)
  })

  test('saves batch batch entity', async () => {
    await processEvent(batchEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: batchEvent.data.filename,
      category: BATCH
    }))
  })

  test('does not send alert for batch event', async () => {
    await processEvent(batchEvent)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound warning event', () => {
  test('saves one warning entity', async () => {
    await processEvent(warningEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledTimes(1)
  })

  test('saves warning entity', async () => {
    await processEvent(warningEvent)
    expect(mockTableClient.createEntity).toHaveBeenCalledWith(expect.objectContaining({
      partitionKey: 'event',
      category: WARNING
    }))
  })

  test('sends alert for warning', async () => {
    await processEvent(warningEvent)
    expect(mockSendMessage.mock.calls[0][0].body).toBe(warningEvent)
  })
})

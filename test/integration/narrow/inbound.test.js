const mockSendMessage = jest.fn()

jest.mock('ffc-messaging', () => ({
  MessageSender: jest.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage,
    closeConnection: jest.fn()
  }))
}))

const mockTableClient = {
  createTable: jest.fn(),
  upsertEntity: jest.fn(),
  listEntities: jest.fn().mockReturnValue([])
}

jest.mock('@azure/data-tables', () => ({
  TableClient: { fromConnectionString: jest.fn().mockReturnValue(mockTableClient) },
  odata: jest.fn()
}))

const { FRN, CORRELATION_ID, SCHEME_ID, BATCH, WARNING } = require('../../../app/constants/categories')
const { initialiseTables } = require('../../../app/storage')
const { processEvent } = require('../../../app/inbound/process-event')

let events = {}

beforeAll(async () => {
  await initialiseTables()
})

beforeEach(() => {
  jest.clearAllMocks()
  events = {
    payment: structuredClone(require('../../mocks/events/payment')),
    hold: structuredClone(require('../../mocks/events/hold')),
    batch: structuredClone(require('../../mocks/events/batch')),
    warning: structuredClone(require('../../mocks/events/warning'))
  }
})

const expectUpsertCalledWith = (entity, category) => {
  expect(mockTableClient.upsertEntity).toHaveBeenCalledWith(
    expect.objectContaining({ partitionKey: entity, category }),
    'Merge'
  )
}

describe('inbound payment event', () => {
  test.each([
    ['FRN', e => e.data.frn.toString(), FRN],
    ['CorrelationId', e => e.data.correlationId, CORRELATION_ID],
    ['SchemeId', e => e.data.schemeId.toString(), SCHEME_ID]
  ])('saves %s payment entity without batch', async (name, keyFn, category) => {
    await processEvent(events.payment)
    expectUpsertCalledWith(keyFn(events.payment), category)
  })

  test('saves 3 payment entities if no batch', async () => {
    await processEvent(events.payment)
    expect(mockTableClient.upsertEntity).toHaveBeenCalledTimes(3)
  })

  test('saves batch payment entity if batch exists', async () => {
    events.payment.data.batch = 'mock-batch'
    await processEvent(events.payment)
    expectUpsertCalledWith(events.payment.data.batch, BATCH)
  })

  test('saves 4 payment entities if batch exists', async () => {
    events.payment.data.batch = 'mock-batch'
    await processEvent(events.payment)
    expect(mockTableClient.upsertEntity).toHaveBeenCalledTimes(4)
  })

  test('does not send alert for payment', async () => {
    await processEvent(events.payment)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound hold event', () => {
  test.each([
    ['FRN', e => e.data.frn.toString(), FRN],
    ['SchemeId', e => e.data.schemeId.toString(), SCHEME_ID]
  ])('saves %s hold entity', async (name, keyFn, category) => {
    await processEvent(events.hold)
    expectUpsertCalledWith(keyFn(events.hold), category)
  })

  test('does not send alert for hold', async () => {
    await processEvent(events.hold)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound batch event', () => {
  test('saves batch entity', async () => {
    await processEvent(events.batch)
    expect(mockTableClient.upsertEntity).toHaveBeenCalledTimes(1)
    expectUpsertCalledWith(events.batch.data.filename, BATCH)
  })

  test('does not send alert for batch', async () => {
    await processEvent(events.batch)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound warning event', () => {
  test('saves warning entity', async () => {
    await processEvent(events.warning)
    expect(mockTableClient.upsertEntity).toHaveBeenCalledTimes(1)
    expectUpsertCalledWith('event', WARNING)
  })

  test('sends alert for warning', async () => {
    await processEvent(events.warning)
    expect(mockSendMessage).toHaveBeenCalledTimes(1)
    expect(mockSendMessage.mock.calls[0][0].body).toBe(events.warning)
  })
})

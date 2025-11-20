const mockSendMessage = jest.fn()

jest.mock('ffc-messaging', () => ({
  MessageSender: jest.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage,
    closeConnection: jest.fn()
  }))
}))

const { odata } = require('@azure/data-tables')
const { PAYMENT_EVENT, HOLD_EVENT, BATCH_EVENT, WARNING_EVENT } = require('../../../app/constants/event-types')
const { processEventMessage } = require('../../../app/messaging/process-event-message')
const { initialiseTables, getClient } = require('../../../app/storage')

const receiver = { completeMessage: jest.fn() }

let clients, events

beforeAll(async () => {
  await initialiseTables()
  clients = {
    [PAYMENT_EVENT]: getClient(PAYMENT_EVENT),
    [HOLD_EVENT]: getClient(HOLD_EVENT),
    [BATCH_EVENT]: getClient(BATCH_EVENT),
    [WARNING_EVENT]: getClient(WARNING_EVENT)
  }
})

beforeEach(async () => {
  // Reset tables
  await Promise.all(Object.values(clients).map(async (c) => {
    await c.deleteTable()
    await c.createTable()
  }))

  // Load fresh event mocks
  events = {
    payment: JSON.parse(JSON.stringify(require('../../mocks/events/payment'))),
    hold: JSON.parse(JSON.stringify(require('../../mocks/events/hold'))),
    batch: JSON.parse(JSON.stringify(require('../../mocks/events/batch'))),
    warning: JSON.parse(JSON.stringify(require('../../mocks/events/warning')))
  }
})

const countAsyncIterator = async (iterator) => {
  let count = 0
  while (!(await iterator.next()).done) {
    count++
  }
  return count
}

describe('processEventMessage', () => {
  const eventTests = [
    [PAYMENT_EVENT, 'payment', ['frn', 'correlationId', 'schemeId', 'batch']],
    [HOLD_EVENT, 'hold', ['frn', 'schemeId']],
    [BATCH_EVENT, 'batch', ['filename']],
    [WARNING_EVENT, 'warning', ['event']]
  ]

  test.each(eventTests)(
    'saves %s event by %p',
    async (eventType, key, partitions) => {
      const event = events[key]
      if (eventType === PAYMENT_EVENT) {
        event.data.batch = 'mock-batch'
      }

      await processEventMessage({ body: event }, receiver)

      for (const p of partitions) {
        const filterValue = event.data[p]?.toString() || 'event'
        const results = clients[eventType].listEntities({ queryOptions: { filter: odata`PartitionKey eq ${filterValue}` } })
        expect(await countAsyncIterator(results)).toBe(1)
      }
    }
  )

  test('sends alert for warning', async () => {
    await processEventMessage({ body: events.warning }, receiver)
    expect(mockSendMessage).toHaveBeenCalled()
  })
})

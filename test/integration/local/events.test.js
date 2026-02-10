const mockSendMessage = jest.fn()

jest.mock('ffc-messaging', () => ({
  MessageSender: jest.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage,
    closeConnection: jest.fn(),
  })),
}))

const {
  FRN,
  CORRELATION_ID,
  SCHEME_ID,
  BATCH,
  WARNING,
} = require('../../../app/constants/categories')

const {
  processEventMessage,
} = require('../../../app/messaging/process-event-message')
const db = require('../../../app/data')

const receiver = { completeMessage: jest.fn() }

let events

beforeAll(async () => {
  await db.sequelize.sync({ force: true })
})

beforeEach(async () => {
  await db.payments.destroy({ where: {}, truncate: true })
  await db.holds.destroy({ where: {}, truncate: true })
  await db.batches.destroy({ where: {}, truncate: true })
  await db.warnings.destroy({ where: {}, truncate: true })

  jest.clearAllMocks()

  events = {
    payment: JSON.parse(JSON.stringify(require('../../mocks/events/payment'))),
    hold: JSON.parse(JSON.stringify(require('../../mocks/events/hold'))),
    batch: JSON.parse(JSON.stringify(require('../../mocks/events/batch'))),
    warning: JSON.parse(JSON.stringify(require('../../mocks/events/warning'))),
  }
})

afterAll(async () => {
  await db.sequelize.close()
})

describe('processEventMessage', () => {
  describe('payment events', () => {
    test('saves payment event with all partition keys', async () => {
      const event = events.payment
      event.data.batch = 'mock-batch'

      await processEventMessage({ body: event }, receiver)

      expect(
        await db.payments.findAll({
          where: { partitionKey: event.data.frn.toString(), category: FRN },
        })
      ).toHaveLength(1)

      expect(
        await db.payments.findAll({
          where: {
            partitionKey: event.data.correlationId,
            category: CORRELATION_ID,
          },
        })
      ).toHaveLength(1)

      expect(
        await db.payments.findAll({
          where: {
            partitionKey: event.data.schemeId.toString(),
            category: SCHEME_ID,
          },
        })
      ).toHaveLength(1)

      expect(
        await db.payments.findAll({
          where: { partitionKey: event.data.batch, category: BATCH },
        })
      ).toHaveLength(1)
    })

    test('saves payment event without batch', async () => {
      const event = events.payment
      delete event.data.batch

      await processEventMessage({ body: event }, receiver)

      expect(await db.payments.findAll()).toHaveLength(3)
      expect(
        await db.payments.findAll({ where: { category: BATCH } })
      ).toHaveLength(0)
    })

    test('saves payment event data as JSON string', async () => {
      await processEventMessage({ body: events.payment }, receiver)

      const records = await db.payments.findAll()
      records.forEach((r) => {
        expect(typeof r.data).toBe('string')
        expect(JSON.parse(r.data)).toEqual(events.payment.data)
      })
    })
  })

  describe('hold events', () => {
    test('saves hold event with all partition keys', async () => {
      const event = events.hold

      await processEventMessage({ body: event }, receiver)

      // FRN
      expect(
        await db.holds.findAll({
          where: { partitionKey: event.data.frn.toString(), category: FRN },
        })
      ).toHaveLength(1)

      const schemeRecords = await db.holds.findAll({
        where: {
          partitionKey: event.data.schemeId.toString(),
          category: SCHEME_ID,
        },
      })
      expect(schemeRecords.length).toBeGreaterThanOrEqual(1)

      const holdCatRecords = await db.holds.findAll({
        where: { partitionKey: event.data.holdCategoryId.toString() },
      })
      expect(holdCatRecords.length).toBeGreaterThanOrEqual(1)
    })

    test('saves exactly 3 hold records', async () => {
      await processEventMessage({ body: events.hold }, receiver)
      expect(await db.holds.findAll()).toHaveLength(3)
    })
  })

  describe('batch events', () => {
    test('saves batch event with filename as partition key', async () => {
      await processEventMessage({ body: events.batch }, receiver)

      expect(
        await db.batches.findAll({
          where: { partitionKey: events.batch.data.filename, category: BATCH },
        })
      ).toHaveLength(1)
    })
  })

  describe('warning events', () => {
    test('saves warning event and sends alert', async () => {
      await processEventMessage({ body: events.warning }, receiver)

      expect(
        await db.warnings.findAll({
          where: { category: WARNING },
        })
      ).toHaveLength(1)

      expect(mockSendMessage).toHaveBeenCalled()
    })
  })

  describe('event properties', () => {
    test('saves all event properties correctly', async () => {
      await processEventMessage({ body: events.payment }, receiver)

      const record = await db.payments.findOne()
      expect(record.source).toBe(events.payment.source)
      expect(record.subject).toBe(events.payment.subject)
      expect(record.time.toISOString()).toBe(events.payment.time)
      expect(record.type).toBe(events.payment.type)
    })

    test('sets timestamp for all records', async () => {
      await processEventMessage({ body: events.payment }, receiver)

      const records = await db.payments.findAll()
      records.forEach((r) => {
        expect(r.timestamp).toBeInstanceOf(Date)
      })
    })
  })
})

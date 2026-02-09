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

const db = require('../../../app/data')
const { processEvent } = require('../../../app/inbound/process-event')

let events = {}

beforeAll(async () => {
  await db.sequelize.sync({ force: true })
})

beforeEach(async () => {
  jest.clearAllMocks()

  await db.payments.destroy({ where: {}, truncate: true })
  await db.holds.destroy({ where: {}, truncate: true })
  await db.batches.destroy({ where: {}, truncate: true })
  await db.warnings.destroy({ where: {}, truncate: true })

  events = {
    payment: structuredClone(require('../../mocks/events/payment')),
    hold: structuredClone(require('../../mocks/events/hold')),
    batch: structuredClone(require('../../mocks/events/batch')),
    warning: structuredClone(require('../../mocks/events/warning')),
  }
})

afterAll(async () => {
  await db.sequelize.close()
})

const expectRecordCreated = async (dbModel, partitionKey, category) => {
  const records = await dbModel.findAll({
    where: {
      PartitionKey: partitionKey,
      category,
    },
  })
  expect(records.length).toBeGreaterThan(0)
}

describe('inbound payment event', () => {
  test.each([
    ['FRN', (e) => e.data.frn.toString(), FRN],
    ['CorrelationId', (e) => e.data.correlationId, CORRELATION_ID],
    ['SchemeId', (e) => e.data.schemeId.toString(), SCHEME_ID],
  ])('saves %s payment entity without batch', async (name, keyFn, category) => {
    await processEvent(events.payment)
    await expectRecordCreated(db.payments, keyFn(events.payment), category)
  })

  test('saves 3 payment entities if no batch', async () => {
    await processEvent(events.payment)
    const records = await db.payments.findAll()
    expect(records).toHaveLength(3)
  })

  test('saves batch payment entity if batch exists', async () => {
    events.payment.data.batch = 'mock-batch'
    await processEvent(events.payment)
    await expectRecordCreated(db.payments, events.payment.data.batch, BATCH)
  })

  test('saves 4 payment entities if batch exists', async () => {
    events.payment.data.batch = 'mock-batch'
    await processEvent(events.payment)
    const records = await db.payments.findAll()
    expect(records).toHaveLength(4)
  })

  test('saves payment data as JSON string', async () => {
    await processEvent(events.payment)
    const records = await db.payments.findAll()
    records.forEach((record) => {
      expect(typeof record.data).toBe('string')
      expect(JSON.parse(record.data)).toEqual(events.payment.data)
    })
  })

  test('saves all payment event properties', async () => {
    await processEvent(events.payment)
    const record = await db.payments.findOne()
    expect(record.source).toBe(events.payment.source)
    expect(record.subject).toBe(events.payment.subject)
    expect(record.time.toISOString()).toBe(events.payment.time)
    expect(record.type).toBe(events.payment.type)
  })

  test('does not send alert for payment', async () => {
    await processEvent(events.payment)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound hold event', () => {
  test.each([
    ['FRN', (e) => e.data.frn.toString(), FRN],
    ['SchemeId', (e) => e.data.schemeId.toString(), SCHEME_ID],
  ])('saves %s hold entity', async (name, keyFn, category) => {
    await processEvent(events.hold)
    await expectRecordCreated(db.holds, keyFn(events.hold), category)
  })

  test('saves 3 hold entities', async () => {
    await processEvent(events.hold)
    const records = await db.holds.findAll()
    expect(records).toHaveLength(3)
  })

  test('saves holdCategoryId entity', async () => {
    await processEvent(events.hold)

    const records = await db.holds.findAll({
      where: {
        PartitionKey: events.hold.data.holdCategoryId.toString(),
      },
    })

    expect(records.length).toBeGreaterThan(0)
  })

  test('saves hold data as JSON string', async () => {
    await processEvent(events.hold)
    const records = await db.holds.findAll()
    records.forEach((record) => {
      expect(typeof record.data).toBe('string')
      expect(JSON.parse(record.data)).toEqual(events.hold.data)
    })
  })

  test('does not send alert for hold', async () => {
    await processEvent(events.hold)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound batch event', () => {
  test('saves batch entity', async () => {
    await processEvent(events.batch)
    const records = await db.batches.findAll()
    expect(records).toHaveLength(1)
    await expectRecordCreated(db.batches, events.batch.data.filename, BATCH)
  })

  test('saves batch with filename as PartitionKey', async () => {
    await processEvent(events.batch)
    const record = await db.batches.findOne()
    expect(record.PartitionKey).toBe(events.batch.data.filename)
  })

  test('saves batch data as JSON string', async () => {
    await processEvent(events.batch)
    const record = await db.batches.findOne()
    expect(typeof record.data).toBe('string')
    expect(JSON.parse(record.data)).toEqual(events.batch.data)
  })

  test('does not send alert for batch', async () => {
    await processEvent(events.batch)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})

describe('inbound warning event', () => {
  test('saves warning entity', async () => {
    await processEvent(events.warning)
    const records = await db.warnings.findAll()
    expect(records).toHaveLength(1)
    await expectRecordCreated(db.warnings, 'event', WARNING)
  })

  test('saves warning with correct category', async () => {
    await processEvent(events.warning)
    const record = await db.warnings.findOne()
    expect(record.category).toBe(WARNING)
  })

  test('saves warning data as JSON string', async () => {
    await processEvent(events.warning)
    const record = await db.warnings.findOne()
    expect(typeof record.data).toBe('string')
    expect(JSON.parse(record.data)).toEqual(events.warning.data)
  })

  test('sends alert for warning', async () => {
    await processEvent(events.warning)
    expect(mockSendMessage).toHaveBeenCalledTimes(1)
    expect(mockSendMessage.mock.calls[0][0].body).toBe(events.warning)
  })
})

describe('common event properties', () => {
  test('generates unique IDs for each record', async () => {
    events.payment.data.batch = 'mock-batch'
    await processEvent(events.payment)

    const records = await db.payments.findAll()
    const ids = records.map((r) => r.id)
    const uniqueIds = [...new Set(ids)]
    expect(uniqueIds).toHaveLength(records.length)
  })

  test('sets timestamp for all records', async () => {
    await processEvent(events.payment)

    const records = await db.payments.findAll()
    records.forEach((record) => {
      expect(record.Timestamp).toBeDefined()
      expect(record.Timestamp).toBeInstanceOf(Date)
      expect(record.Timestamp.getTime()).not.toBeNaN()
    })
  })

  test('preserves event type across all records', async () => {
    await processEvent(events.payment)

    const records = await db.payments.findAll()
    records.forEach((record) => {
      expect(record.type).toBe(events.payment.type)
    })
  })
})

const mockFiles = {}

jest.mock('../../../app/storage', () => ({
  streamDataRequestFile: jest.fn((filename, stream) => new Promise((resolve, reject) => {
    let content = ''
    stream.on('data', (chunk) => { content += chunk })
    stream.on('end', () => {
      mockFiles[filename] = content
      resolve()
    })
    stream.on('error', reject)
  }))
}))

const { randomUUID } = require('node:crypto')
const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const { generateSqlQuery } = require('../../../app/data-requests/file-generator')
const { getEventsByFrn } = require('../../../app/data-requests/frn/get-events-by-frn')
const { getEventsByBatch } = require('../../../app/data-requests/batch/get-events-by-batch')
const { getEvents } = require('../../../app/data-requests/correlation-id/utils/get-events')
const { getEventsByScheme } = require('../../../app/data-requests/scheme-id/get-events-by-scheme')
const { getSuppressedReportData } = require('../../../app/report-data/get-suppressed-report-data')
const { PAYMENT_EXTRACTED, PAYMENT_SUBMITTED, PAYMENT_SUPPRESSED } = require('../../../app/constants/events')

const createPayment = (partitionKey, category, type, data, time) => ({
  id: randomUUID(),
  partitionKey,
  rowKey: `${data.correlationId}|${data.invoiceNumber}|${time}`,
  timestamp: time,
  type,
  source: 'ffc-pay-test',
  subject: 'None',
  time,
  category,
  data: JSON.stringify(data)
})

const payment = {
  frn: 1234567890,
  schemeId: 1,
  agreementNumber: 'AG1',
  correlationId: 'c1',
  batch: "b'1",
  invoiceNumber: 'INV1',
  paymentRequestNumber: 1,
  value: 12345
}

const readExport = (filename) => JSON.parse(mockFiles[filename])

describe('data requests against Postgres', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('generated SQL filters and orders rows when run against Postgres', async () => {
    await db.payments().insert([
      createPayment('1234567890', 'frn', PAYMENT_EXTRACTED, { ...payment, correlationId: 'c2', schemeId: 2 }, '2026-09-30T10:00:00.000Z'),
      createPayment('1234567890', 'frn', PAYMENT_EXTRACTED, payment, '2026-09-30T11:00:00.000Z'),
      createPayment('9999999999', 'frn', PAYMENT_EXTRACTED, { ...payment, frn: 9999999999, correlationId: 'c3' }, '2026-09-30T12:00:00.000Z')
    ])

    const sql = generateSqlQuery({ frn: '1234567890' }, 'paymentFrnEvents', [['schemeId', 'ASC'], ['lastUpdated', 'DESC']])
    const { rows } = await db.client.raw(sql)

    expect(rows.map(row => [row.frn, row.schemeId, row.correlationId])).toEqual([
      ['1234567890', 1, 'c1'],
      ['1234567890', 2, 'c2']
    ])
  })

  test('generated SQL escapes quotes in filter values', async () => {
    await db.payments().insert(createPayment(payment.batch, 'batch', PAYMENT_EXTRACTED, payment, '2026-09-30T10:00:00.000Z'))

    const sql = generateSqlQuery({ batchName: payment.batch }, 'paymentBatchEvents')
    const { rows } = await db.client.raw(sql)

    expect(rows).toHaveLength(1)
    expect(rows[0].batchName).toBe(payment.batch)
  })

  test('streams the frn export through a pooled connection', async () => {
    await db.payments().insert([
      createPayment('1234567890', 'frn', PAYMENT_EXTRACTED, payment, '2026-09-30T10:00:00.000Z'),
      createPayment('1234567890', 'frn', PAYMENT_EXTRACTED, { ...payment, correlationId: 'c2', paymentRequestNumber: 2 }, '2026-09-30T11:00:00.000Z')
    ])

    const filename = await getEventsByFrn('1234567890')
    const { data } = readExport(filename)

    expect(data).toHaveLength(2)
    expect(data.map(row => row.paymentRequestNumber)).toEqual([1, 2])
    data.forEach(row => expect(row.frn).toBe('1234567890'))
  })

  test('streams the batch export', async () => {
    await db.payments().insert(createPayment(payment.batch, 'batch', PAYMENT_EXTRACTED, payment, '2026-09-30T10:00:00.000Z'))

    const filename = await getEventsByBatch(payment.batch)
    const { data } = readExport(filename)

    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({ batch: payment.batch, frn: '1234567890', agreementNumber: 'AG1' })
  })

  test('streams the suppressed report', async () => {
    await db.payments().insert([
      createPayment('1234567890', 'frn', PAYMENT_SUPPRESSED, payment, '2026-09-30T10:00:00.000Z'),
      createPayment('1234567890', 'frn', PAYMENT_EXTRACTED, payment, '2026-09-30T11:00:00.000Z')
    ])

    const filename = await getSuppressedReportData()
    const rows = readExport(filename)

    expect(rows).toHaveLength(1)
    expect(rows[0].type).toBe(PAYMENT_SUPPRESSED)
  })

  test('returns all connections to the pool after exporting', async () => {
    const pool = db.client.client.pool

    await getEventsByFrn('1234567890')
    await getEventsByFrn('1234567890')

    expect(pool.numUsed()).toBe(0)
  })

  test('getEvents returns events in timestamp order with parsed data', async () => {
    await db.payments().insert([
      createPayment('c1', 'correlationId', PAYMENT_EXTRACTED, { ...payment, invoiceNumber: 'LATER' }, '2026-09-30T11:00:00.000Z'),
      createPayment('c1', 'correlationId', PAYMENT_EXTRACTED, payment, '2026-09-30T10:00:00.000Z'),
      createPayment('c1', 'frn', PAYMENT_EXTRACTED, payment, '2026-09-30T09:00:00.000Z')
    ])

    const events = await getEvents('c1', 'correlationId')

    expect(events).toHaveLength(2)
    expect(events.map(event => event.data.invoiceNumber)).toEqual(['INV1', 'LATER'])
    expect(Object.keys(events[0])).toEqual(['id', 'partitionKey', 'rowKey', 'timestamp', 'type', 'source', 'time', 'category', 'data', 'subject'])
  })

  test('getEventsByScheme filters the view by a numeric schemeId', async () => {
    await db.payments().insert([
      createPayment('1', 'schemeId', PAYMENT_SUBMITTED, { schemeId: 1, value: 12345 }, '2026-09-30T10:00:00.000Z'),
      createPayment('5', 'schemeId', PAYMENT_SUBMITTED, { schemeId: 5, value: 500 }, '2026-09-30T10:00:00.000Z')
    ])

    const result = await getEventsByScheme(1)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ paymentRequests: 1, value: '£123.45' })
  })

  test('getEventsByScheme returns every scheme when no schemeId is supplied', async () => {
    await db.payments().insert([
      createPayment('1', 'schemeId', PAYMENT_SUBMITTED, { schemeId: 1, value: 12345 }, '2026-09-30T10:00:00.000Z'),
      createPayment('5', 'schemeId', PAYMENT_SUBMITTED, { schemeId: 5, value: 500 }, '2026-09-30T10:00:00.000Z')
    ])

    const result = await getEventsByScheme()

    expect(result).toHaveLength(2)
  })
})

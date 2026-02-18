const { FRN } = require('../../../../../mocks/values/frn')
const {
  INVOICE_NUMBER,
} = require('../../../../../mocks/values/invoice-number')
const {
  BPS,
  CS,
  SFI,
  SFI23,
  DELINKED,
  SFI_EXPANDED,
  COHT_REVENUE,
  COHT_CAPITAL,
} = require('../../../../../../app/constants/schemes')
const { SCHEME_ID } = require('../../../../../../app/constants/categories')
const { PAYMENT_SUBMITTED } = require('../../../../../../app/constants/events')
const schemeNames = require('../../../../../../app/constants/scheme-names')
const {
  getEventsByScheme,
} = require('../../../../../../app/outbound/events/scheme-id/get-events-by-scheme')
const db = require('../../../../../../app/data')
const { v4: uuidv4 } = require('uuid')

let events = {}
let nextEventId

const SCHEMES = [
  SFI,
  CS,
  BPS,
  SFI23,
  DELINKED,
  SFI_EXPANDED,
  COHT_REVENUE,
  COHT_CAPITAL,
]

// --- FIX: stringify data, match type and category exactly ---
const formatAndAddEvent = async (dbModel, event, schemeId) => {
  const formattedEvent = {
    id: uuidv4(),
    partitionKey: schemeId.toString(),
    rowKey: `${FRN}|${INVOICE_NUMBER}|157070221${nextEventId++}`,
    timestamp: Date.now() + nextEventId,
    data: JSON.stringify(event.data), // stringified
    category: SCHEME_ID, // ensure matches filter
    type: PAYMENT_SUBMITTED, // ensure matches filter
    source: event.source,
    subject: event.subject,
    time: event.time,
  }
  await dbModel.create(formattedEvent)
}

beforeAll(async () => {
  await db.sequelize.sync({ force: true })
})

beforeEach(async () => {
  nextEventId = 1
  await db.payments.destroy({ where: {}, truncate: true })
  await db.holds.destroy({ where: {}, truncate: true })
  await db.batches.destroy({ where: {}, truncate: true })
  await db.warnings.destroy({ where: {}, truncate: true })

  events = {
    submitted: structuredClone(
      require('../../../../../mocks/events/submitted')
    ),
    processed: structuredClone(
      require('../../../../../mocks/events/processed')
    ),
    enriched: structuredClone(require('../../../../../mocks/events/enriched')),
    extracted: structuredClone(
      require('../../../../../mocks/events/extracted')
    ),
  }

  // ensure submitted type and category match filter
  events.submitted.type = PAYMENT_SUBMITTED
  events.submitted.category = SCHEME_ID
  // ensure data has required fields
  if (!events.submitted.data) {
    events.submitted.data = {}
  }
  events.submitted.data.value = 100000 // in pence: 100,000p = £1,000.00
  events.submitted.data.frn = FRN
  events.submitted.data.invoiceNumber = INVOICE_NUMBER

  for (const scheme of SCHEMES) {
    // 2 submitted events per scheme
    await formatAndAddEvent(db.payments, events.submitted, scheme)
    await formatAndAddEvent(db.payments, events.submitted, scheme)

    // other events (ignored)
    const ignored = [events.processed, events.enriched, events.extracted]
    for (const evt of ignored) {
      await db.payments.create({
        id: uuidv4(),
        partitionKey: scheme.toString(),
        rowKey: `${FRN}|${INVOICE_NUMBER}|ignored-${uuidv4()}`,
        timestamp: Date.now() + nextEventId++,
        data: JSON.stringify(evt.data),
        category: 'OTHER_CATEGORY',
        type: 'OTHER_TYPE',
        source: evt.source,
        subject: evt.subject,
        time: evt.time,
      })
    }
  }
})

afterAll(async () => {
  await db.sequelize.close()
})

describe('get events by scheme', () => {
  test.each(SCHEMES.map((scheme, i) => [i, scheme]))(
    'should return correct data for scheme %s',
    async (_, scheme) => {
      const result = await getEventsByScheme()
      const schemeData = result.find((r) => r.scheme === schemeNames[scheme])
      expect(schemeData).toBeDefined()
      expect(schemeData.scheme).toBe(schemeNames[scheme])
      expect(schemeData.paymentRequests).toBe(2)
      expect(schemeData.value).toBe('£2,000.00')
    }
  )

  test('should have 2 submitted events per scheme', async () => {
    const result = await getEventsByScheme()
    result.forEach((schemeData) => {
      // The events are aggregated, not returned as an array
      expect(schemeData.paymentRequests).toBe(2)
    })
  })

  test('should sanitise scheme data', async () => {
    const result = await getEventsByScheme()
    result.forEach((schemeData) => {
      expect(schemeData.scheme).toBeDefined()
      expect(schemeData.paymentRequests).toBeDefined()
      expect(schemeData.value).toBeDefined()
      // events are aggregated, not returned as array
    })
  })

  test('should not include non-submitted events', async () => {
    const result = await getEventsByScheme()
    const totalEvents = result.reduce((sum, schemeData) => {
      return sum + schemeData.paymentRequests
    }, 0)
    expect(totalEvents).toBe(SCHEMES.length * 2)
  })

  test('should only query payments table', async () => {
    const testScheme = SFI
    const extraEvent = { ...events.submitted }
    await formatAndAddEvent(db.holds, extraEvent, testScheme)
    await formatAndAddEvent(db.batches, extraEvent, testScheme)
    await formatAndAddEvent(db.warnings, extraEvent, testScheme)

    const result = await getEventsByScheme()
    const schemeData = result.find((r) => r.scheme === schemeNames[testScheme])
    expect(schemeData.paymentRequests).toBe(2)
  })
})

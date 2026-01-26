const { FRN } = require('../../../../../mocks/values/frn')
const { INVOICE_NUMBER } = require('../../../../../mocks/values/invoice-number')

const {
  BPS, CS, SFI, SFI23, DELINKED, SFI_EXPANDED, COHT_REVENUE, COHT_CAPITAL
} = require('../../../../../../app/constants/schemes')

const { PAYMENT_EVENT, HOLD_EVENT, BATCH_EVENT, WARNING_EVENT } = require('../../../../../../app/constants/event-types')
const schemeNames = require('../../../../../../app/constants/scheme-names')
const { getEventsByScheme } = require('../../../../../../app/data/events/scheme-id/get-events-by-scheme')
const { initialise: initialiseTables, getClient } = require('../../../../../../app/storage')

let clients = {}
let events = {}
let nextEventId

const SCHEMES = [SFI, CS, BPS, SFI23, DELINKED, SFI_EXPANDED, COHT_REVENUE, COHT_CAPITAL]
const EVENT_TYPES = [PAYMENT_EVENT, HOLD_EVENT, BATCH_EVENT, WARNING_EVENT]

const formatAndAddEvent = async (tableClient, event, schemeId) => {
  const formattedEvent = {
    ...event,
    partitionKey: schemeId.toString(),
    rowKey: `${FRN}|${INVOICE_NUMBER}|157070221${nextEventId++}`,
    data: JSON.stringify(event.data),
    category: 'schemeId'
  }
  await tableClient.createEntity(formattedEvent)
}

beforeAll(async () => {
  await initialiseTables()
  clients = EVENT_TYPES.reduce((acc, type) => {
    acc[type] = getClient(type)
    return acc
  }, {})
})

beforeEach(async () => {
  nextEventId = 1

  for (const client of Object.values(clients)) {
    await client.deleteTable()
    await client.createTable()
  }

  events = {
    submitted: structuredClone(require('../../../../../mocks/events/submitted')),
    processed: structuredClone(require('../../../../../mocks/events/processed')),
    enriched: structuredClone(require('../../../../../mocks/events/enriched')),
    extracted: structuredClone(require('../../../../../mocks/events/extracted'))
  }

  for (const scheme of SCHEMES) {
    for (const type of EVENT_TYPES) {
      await formatAndAddEvent(clients[type], events.submitted, scheme)
      await formatAndAddEvent(clients[type], events.submitted, scheme)
      await formatAndAddEvent(clients[type], events.processed, scheme)
      await formatAndAddEvent(clients[type], events.enriched, scheme)
      await formatAndAddEvent(clients[type], events.extracted, scheme)
    }
  }
})

describe('get events by scheme', () => {
  test.each(SCHEMES.map((scheme, i) => [i, scheme]))(
    'should return correct data for scheme %s',
    async (_, scheme) => {
      const result = await getEventsByScheme()
      const schemeData = result.find(r => r.scheme === schemeNames[scheme])
      expect(schemeData.scheme).toBe(schemeNames[scheme])
      expect(schemeData.paymentRequests).toBe(2)
      expect(schemeData.value).toBe('£2,000.00')
    }
  )

  test('should order scheme data by schemeId', async () => {
    const result = await getEventsByScheme()
    SCHEMES.forEach((scheme, i) => {
      expect(result[i].scheme).toBe(schemeNames[scheme])
    })
  })
})

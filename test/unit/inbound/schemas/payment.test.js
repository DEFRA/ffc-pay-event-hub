const schema = require('../../../../app/inbound/schemas/payment')

let baseEvent

describe('payment schema', () => {
  beforeEach(() => {
    baseEvent = structuredClone(require('../../../mocks/events/payment').data)
  })

  test('validates a correct payment event', () => {
    const event = structuredClone(baseEvent)
    expect(schema.validate(event).error).toBeUndefined()
  })

  test('validates event with only one customer identifier (sbi, trader, vendor)', () => {
    const identifiers = [
      { mutate: e => { delete e.frn; e.sbi = 123 }, name: 'sbi' },
      { mutate: e => { delete e.frn; e.trader = 'someTrader' }, name: 'trader' },
      { mutate: e => { delete e.frn; e.vendor = 'someVendor' }, name: 'vendor' }
    ]

    identifiers.forEach(({ mutate }) => {
      const event = structuredClone(baseEvent)
      mutate(event)
      expect(schema.validate(event).error).toBeUndefined()
    })
  })

  const invalidCases = [
    ['non-number sbi', e => { e.sbi = 'abc' }],
    ['non-integer sbi', e => { e.sbi = 1.1 }],
    ['negative sbi', e => { e.sbi = -1 }],

    ['non-string trader', e => { e.trader = 1 }],
    ['non-string vendor', e => { e.vendor = 1 }],

    ['undefined correlationId', e => { delete e.correlationId }],
    ['null correlationId', e => { e.correlationId = null }],
    ['non-string correlationId', e => { e.correlationId = 1 }],
    ['non-uuid correlationId', e => { e.correlationId = 'abc' }],

    ['undefined schemeId', e => { delete e.schemeId }],
    ['null schemeId', e => { e.schemeId = null }],
    ['non-number schemeId', e => { e.schemeId = 'abc' }],
    ['non-integer schemeId', e => { e.schemeId = 1.1 }],
    ['negative schemeId', e => { e.schemeId = -1 }],

    ['undefined invoiceNumber', e => { delete e.invoiceNumber }],
    ['null invoiceNumber', e => { e.invoiceNumber = null }],
    ['non-string invoiceNumber', e => { e.invoiceNumber = 1 }],
    ['empty invoiceNumber', e => { e.invoiceNumber = '' }]
  ]

  test.each(invalidCases)('does not validate payment event with %s', (_, mutate) => {
    const event = structuredClone(baseEvent)
    mutate(event)
    expect(schema.validate(event).error).toBeDefined()
  })
})

const schema = require('../../../../app/inbound/schemas/hold')

let baseEvent

describe('hold schema', () => {
  beforeEach(() => {
    baseEvent = structuredClone(require('../../../mocks/events/hold').data)
  })

  test('validates a correct hold event', () => {
    const event = structuredClone(baseEvent)
    expect(schema.validate(event).error).toBeUndefined()
  })

  const invalidCases = [
    ['undefined frn', e => { delete e.frn }],
    ['null frn', e => { e.frn = null }],
    ['non-number frn', e => { e.frn = 'abc' }],
    ['non-integer frn', e => { e.frn = 1.1 }],
    ['negative frn', e => { e.frn = -1 }],

    ['undefined schemeId', e => { delete e.schemeId }],
    ['null schemeId', e => { e.schemeId = null }],
    ['non-number schemeId', e => { e.schemeId = 'abc' }],
    ['non-integer schemeId', e => { e.schemeId = 1.1 }],
    ['negative schemeId', e => { e.schemeId = -1 }],

    ['undefined holdCategoryId', e => { delete e.holdCategoryId }],
    ['null holdCategoryId', e => { e.holdCategoryId = null }],
    ['non-number holdCategoryId', e => { e.holdCategoryId = 'abc' }],
    ['non-integer holdCategoryId', e => { e.holdCategoryId = 1.1 }],
    ['negative holdCategoryId', e => { e.holdCategoryId = -1 }]
  ]

  test.each(invalidCases)('does not validate hold event with %s', (_, mutate) => {
    const event = structuredClone(baseEvent)
    mutate(event)
    expect(schema.validate(event).error).toBeDefined()
  })
})

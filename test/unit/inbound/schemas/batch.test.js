const schema = require('../../../../app/inbound/schemas/batch')

let baseEvent

describe('batch schema', () => {
  beforeEach(() => {
    baseEvent = structuredClone(require('../../../mocks/events/batch').data)
  })

  test('validates a correct batch event', () => {
    const event = structuredClone(baseEvent)
    expect(schema.validate(event).error).toBeUndefined()
  })

  const invalidCases = [
    ['undefined filename', e => { delete e.filename }],
    ['null filename', e => { e.filename = null }],
    ['non-string filename', e => { e.filename = 1 }]
  ]

  test.each(invalidCases)('does not validate batch event with %s', (_, mutate) => {
    const event = structuredClone(baseEvent)
    mutate(event)
    expect(schema.validate(event).error).toBeDefined()
  })
})

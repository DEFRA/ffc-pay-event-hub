const schema = require('../../../../app/inbound/schemas/warning')

let event

describe('warning schema', () => {
  beforeEach(() => {
    event = structuredClone(require('../../../mocks/events/warning').data)
  })

  test('validates a correct warning event', () => {
    expect(schema.validate(event).error).toBeUndefined()
  })

  test.each([
    ['undefined message', e => { delete e.message }],
    ['null message', e => { e.message = null }],
    ['non-string message', e => { e.message = 1 }]
  ])('does not validate warning event with %s', (_, mutate) => {
    mutate(event)
    expect(schema.validate(event).error).toBeDefined()
  })
})

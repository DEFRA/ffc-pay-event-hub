const { getWarningType } = require('../../../../app/inbound/save-event/get-warning-type')

describe('get warning type', () => {
  test('returns text after warning text', () => {
    const eventType = 'uk.gov.ffc.pay.warning.event.happened'
    const warningType = getWarningType(eventType)
    expect(warningType).toBe('event.happened')
  })
})

const { BPS, CS } = require('../../../../../app/constants/schemes')
const {
  getTotalSchemeValues,
} = require('../../../../../app/outbound/events/scheme-id/get-total-scheme-values')

let submitted
let bpsEvent
let csEvent
let groupedEvents

describe('getTotalSchemeValues', () => {
  beforeEach(() => {
    submitted = require('../../../../mocks/events/submitted')
    bpsEvent = { ...submitted, PartitionKey: BPS }
    csEvent = { ...submitted, PartitionKey: CS }

    groupedEvents = [
      { schemeId: CS.toString(), events: [csEvent, csEvent, csEvent] },
      { schemeId: BPS.toString(), events: [bpsEvent, bpsEvent, bpsEvent] },
    ]
  })

  test('should return an array with correct length', () => {
    const result = getTotalSchemeValues(groupedEvents)
    expect(result.length).toBe(2)
  })

  test('should return array of objects with schemeId, paymentRequests and value', () => {
    const result = getTotalSchemeValues(groupedEvents)
    expect(result[0]).toStrictEqual({
      schemeId: '5',
      paymentRequests: 3,
      value: 300000,
    })
  })

  test('should correctly handle multiple scenarios', () => {
    const scenarios = [
      [
        'total paymentRequests equals number of events',
        0,
        { paymentRequests: groupedEvents[0].events.length },
      ],
      [
        'schemeId equals groupedEvents schemeId',
        0,
        { schemeId: groupedEvents[0].schemeId },
      ],
      [
        'value equals sum of events values when there are multiple events',
        0,
        { value: 300000 },
      ],
      [
        'value equals sum of events values when there is only one event',
        0,
        { value: 100000 },
        () => groupedEvents[0].events.splice(1, 2),
      ],
      [
        'value is 0 if event value is 0',
        0,
        { value: 0 },
        () => {
          groupedEvents[0].events.splice(1, 2)
          groupedEvents[0].events[0].data.value = 0
        },
      ],
    ]

    scenarios.forEach(([name, index, expected, setup]) => {
      if (setup) {
        setup()
      }

      const result = getTotalSchemeValues(groupedEvents)
      Object.entries(expected).forEach(([key, value]) => {
        expect(result[index][key]).toBe(value)
      })
    })
  })
})

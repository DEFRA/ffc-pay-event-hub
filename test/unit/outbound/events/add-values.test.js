jest.mock('../../../../app/currency')
const {
  convertToString: mockConvertToString,
} = require('../../../../app/currency')

const acknowledged = require('../../../mocks/events/acknowledged')
const enriched = require('../../../mocks/events/enriched')
const processed = require('../../../mocks/events/processed')
const submitted = require('../../../mocks/events/submitted')

const { addValues } = require('../../../../app/outbound/events/add-values')
const { FC } = require('../../../../app/constants/schemes')

let groupedEvent

describe('add value to events', () => {
  beforeEach(() => {
    groupedEvent = structuredClone(
      require('../../../mocks/events/grouped-event')
    )
    groupedEvent.events = [
      structuredClone(enriched),
      structuredClone(processed),
      structuredClone(submitted),
      structuredClone(acknowledged),
    ]
    mockConvertToString.mockImplementation((value) =>
      value !== undefined && value !== null ? value.toString() : '0'
    )
  })

  test('should return empty array if no events', () => {
    expect(addValues([])).toHaveLength(0)
  })

  test('should include all existing group level properties', () => {
    const result = addValues([groupedEvent])
    expect(result[0]).toMatchObject(groupedEvent)
  })

  const valueTests = [
    { prop: 'originalValue', eventIndex: 0, expected: enriched.data.value },
    {
      prop: 'originalValueText',
      eventIndex: 0,
      expected: enriched.data.value.toString(),
    },
    { prop: 'currentValue', eventIndex: 3, expected: acknowledged.data.value },
    {
      prop: 'currentValueText',
      eventIndex: 3,
      expected: acknowledged.data.value.toString(),
    },
  ]

  test.each(valueTests)(
    'should add %s from event at index $eventIndex',
    ({ prop, eventIndex, expected }) => {
      const result = addValues([groupedEvent])
      expect(result[0][prop]).toBe(expected)
    }
  )

  test('should add original value from second event if first is absent for FC', () => {
    delete groupedEvent.events[0].data.value
    groupedEvent.events[0].data.schemeId = FC

    if (groupedEvent.events[1].data.value === undefined) {
      groupedEvent.events[1].data.value = 12345
    }

    const result = addValues([groupedEvent])
    const fallbackValue = groupedEvent.events[1].data.value
    expect(result[0].originalValue).toBe(fallbackValue)
    expect(result[0].originalValueText).toBe(fallbackValue.toString())
  })
})

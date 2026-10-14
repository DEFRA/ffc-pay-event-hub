const TABLES = require('../../../app/constants/tables')
const { pickColumns } = require('../../../app/constants/columns')

describe('pickColumns', () => {
  test('keeps properties that are columns on the table', () => {
    const record = { id: 1, partitionKey: 'value' }

    expect(pickColumns(record, TABLES.batches)).toEqual(record)
  })

  test('drops properties that are not columns on the table', () => {
    const result = pickColumns({ id: 1, notAColumn: 'value' }, TABLES.batches)

    expect(result).toEqual({ id: 1 })
  })

  test('returns an empty object when given no properties', () => {
    expect(pickColumns({}, TABLES.batches)).toEqual({})
  })
})

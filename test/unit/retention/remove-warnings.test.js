const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['warnings'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { getSchemeIds } = require('ffc-pay-schemes')
const { removeWarnings } = require('../../../app/retention/remove-warnings')
const { MANUAL } = getSchemeIds()

describe('removeWarnings', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = mockDb.trx

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes warnings matching agreementNumber, frn and schemeId inside the transaction when usesContractNumber is false', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, false, undefined, transaction)

    expect(mockDb.tables.warnings).toHaveBeenCalledWith(transaction)
    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(3)
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith('"data" #>> \'{agreementNumber}\' = ?', [agreementNumber])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'frn')::int = ?", [frn])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'schemeId')::int = ?", [schemeId])
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('deletes warnings matching contractNumber when usesContractNumber is true', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, true, undefined, transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith('"data" #>> \'{contractNumber}\' = ?', [agreementNumber])
    expect(mockDb.builder.whereRaw).not.toHaveBeenCalledWith('"data" #>> \'{agreementNumber}\' = ?', expect.anything())
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('binds frn and schemeId as numbers', async () => {
    await removeWarnings(agreementNumber, '1234567890', '5', false, undefined, transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'frn')::int = ?", [1234567890])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'schemeId')::int = ?", [5])
  })

  test('runs on the pool when no transaction is provided, usesContractNumber false', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, false)

    expect(mockDb.tables.warnings).toHaveBeenCalledWith(undefined)
  })

  test('runs on the pool when no transaction is provided, usesContractNumber true', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, true)

    expect(mockDb.tables.warnings).toHaveBeenCalledWith(undefined)
  })

  test('runs on the pool when the transaction is null', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, false, undefined, null)

    expect(mockDb.tables.warnings).toHaveBeenCalledWith(undefined)
  })

  test('adds a pillar condition when scheme is manual', async () => {
    await removeWarnings(agreementNumber, frn, MANUAL, false, 'SFI23', transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith('"data" #>> \'{pillar}\' = ?', ['SFI23'])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(4)
  })

  test('does not add a pillar condition when scheme is manual but no pillar supplied', async () => {
    await removeWarnings(agreementNumber, frn, MANUAL, false, undefined, transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(3)
  })

  test('does not add a pillar condition when scheme is not manual', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, false, 'SFI23', transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(3)
  })

  test('propagates database errors', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removeWarnings(agreementNumber, frn, schemeId, false, undefined, transaction)).rejects.toThrow('DB failure')
  })
})

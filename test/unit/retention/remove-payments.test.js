const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['payments'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { getSchemeIds } = require('ffc-pay-schemes')
const { removePayments } = require('../../../app/retention/remove-payments')
const { MANUAL } = getSchemeIds()

describe('removePayments', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = mockDb.trx

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.knex.raw.mockImplementation(sql => ({ sql }))
    mockDb.builder.resolves([])
  })

  test('deletes payments matching agreementNumber, frn and schemeId inside the transaction when usesContractNumber is false', async () => {
    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      false,
      undefined,
      transaction
    )

    expect(mockDb.tables.payments).toHaveBeenCalledTimes(1)
    expect(mockDb.tables.payments).toHaveBeenCalledWith(transaction)
    expect(mockDb.builder.select).not.toHaveBeenCalled()
    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(3)
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith('"data" #>> \'{agreementNumber}\' = ?', [agreementNumber])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'frn')::int = ?", [frn])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'schemeId')::int = ?", [schemeId])
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)

    expect(result).toEqual({
      batches: [],
      agreementNumbers: [],
      correlationIds: []
    })
  })

  test('finds related payment data, removes payments and returns unique values when usesContractNumber is true', async () => {
    mockDb.builder.resolves([
      {
        batch: 'batch-1',
        agreementNumber: 'AGR001',
        correlationId: 'corr-1'
      },
      {
        batch: 'batch-1',
        agreementNumber: 'AGR001',
        correlationId: 'corr-1'
      },
      {
        batch: 'batch-2',
        agreementNumber: 'AGR002',
        correlationId: 'corr-2'
      }
    ])

    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      true,
      undefined,
      transaction
    )

    expect(mockDb.tables.payments).toHaveBeenCalledTimes(2)
    expect(mockDb.tables.payments).toHaveBeenNthCalledWith(1, transaction)
    expect(mockDb.tables.payments).toHaveBeenNthCalledWith(2, transaction)
    expect(mockDb.builder.select).toHaveBeenCalledWith(
      { sql: "data->>'batch' AS \"batch\"" },
      { sql: "data->>'agreementNumber' AS \"agreementNumber\"" },
      { sql: "data->>'correlationId' AS \"correlationId\"" }
    )
    expect(mockDb.builder.modify).toHaveBeenCalledTimes(2)
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith('"data" #>> \'{contractNumber}\' = ?', [agreementNumber])
    expect(mockDb.builder.whereRaw).not.toHaveBeenCalledWith('"data" #>> \'{agreementNumber}\' = ?', expect.anything())
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)

    expect(result).toEqual({
      batches: ['batch-1', 'batch-2'],
      agreementNumbers: ['AGR001', 'AGR002'],
      correlationIds: ['corr-1', 'corr-2']
    })
  })

  test('filters null and undefined values from returned arrays', async () => {
    mockDb.builder.resolves([
      {
        batch: 'batch-1',
        agreementNumber: 'AGR001',
        correlationId: 'corr-1'
      },
      {
        batch: null,
        agreementNumber: undefined,
        correlationId: ''
      }
    ])

    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      true,
      undefined,
      transaction
    )

    expect(result).toEqual({
      batches: ['batch-1'],
      agreementNumbers: ['AGR001'],
      correlationIds: ['corr-1']
    })
  })

  test('binds frn and schemeId as numbers', async () => {
    await removePayments(agreementNumber, '1234567890', '5', false, undefined, transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'frn')::int = ?", [1234567890])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith("(data->>'schemeId')::int = ?", [5])
  })

  test('runs on the pool when no transaction is provided and usesContractNumber is false', async () => {
    await removePayments(
      agreementNumber,
      frn,
      schemeId,
      false
    )

    expect(mockDb.tables.payments).toHaveBeenCalledWith(undefined)
  })

  test('runs on the pool when no transaction is provided and usesContractNumber is true', async () => {
    await removePayments(
      agreementNumber,
      frn,
      schemeId,
      true
    )

    expect(mockDb.tables.payments).toHaveBeenCalledTimes(2)
    expect(mockDb.tables.payments).toHaveBeenNthCalledWith(1, undefined)
    expect(mockDb.tables.payments).toHaveBeenNthCalledWith(2, undefined)
  })

  test('runs on the pool when the transaction is null', async () => {
    await removePayments(agreementNumber, frn, schemeId, true, undefined, null)

    expect(mockDb.tables.payments).toHaveBeenNthCalledWith(1, undefined)
    expect(mockDb.tables.payments).toHaveBeenNthCalledWith(2, undefined)
  })

  test('propagates errors from the select', async () => {
    mockDb.builder.rejects(new Error('select failure'))

    await expect(
      removePayments(
        agreementNumber,
        frn,
        schemeId,
        true,
        undefined,
        transaction
      )
    ).rejects.toThrow('select failure')

    expect(mockDb.builder.del).not.toHaveBeenCalled()
  })

  test('adds a pillar condition when scheme is manual', async () => {
    await removePayments(agreementNumber, frn, MANUAL, false, 'SFI23', transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledWith('"data" #>> \'{pillar}\' = ?', ['SFI23'])
    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(4)
  })

  test('applies the pillar condition to both the select and the delete when scheme is manual', async () => {
    await removePayments(agreementNumber, frn, MANUAL, true, 'SFI23', transaction)

    const pillarCalls = mockDb.builder.whereRaw.mock.calls.filter(([sql]) => sql === '"data" #>> \'{pillar}\' = ?')
    expect(pillarCalls).toHaveLength(2)
  })

  test('does not add a pillar condition when scheme is manual but no pillar supplied', async () => {
    await removePayments(agreementNumber, frn, MANUAL, false, undefined, transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(3)
  })

  test('does not add a pillar condition when scheme is not manual', async () => {
    await removePayments(agreementNumber, frn, schemeId, false, 'SFI23', transaction)

    expect(mockDb.builder.whereRaw).toHaveBeenCalledTimes(3)
  })

  test('propagates errors from the delete', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(
      removePayments(
        agreementNumber,
        frn,
        schemeId,
        false,
        undefined,
        transaction
      )
    ).rejects.toThrow('DB failure')
  })

  test('returns empty arrays when no matching payments are found', async () => {
    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      true,
      undefined,
      transaction
    )

    expect(result).toEqual({
      batches: [],
      agreementNumbers: [],
      correlationIds: []
    })
  })
})

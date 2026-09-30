const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentBatchEvents'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removePaymentBatchEvents } = require('../../../app/retention/remove-payment-batch-events')

describe('removePaymentBatchEvents', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = mockDb.trx

  const batches = ['batch-1', 'batch-2']
  const agreementNumbers = ['AGR123', 'AGR456']

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes by agreementNumber, frn and schemeId inside the transaction when usesContractNumber is false', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      batches,
      agreementNumbers,
      transaction
    )

    expect(mockDb.tables.paymentBatchEvents).toHaveBeenCalledWith(transaction)
    expect(mockDb.builder.where).toHaveBeenCalledWith({
      agreementNumber,
      frn,
      schemeId
    })
    expect(mockDb.builder.whereIn).not.toHaveBeenCalled()
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('deletes by batchName and agreementNumber lists inside the transaction when usesContractNumber is true', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      batches,
      agreementNumbers,
      transaction
    )

    expect(mockDb.tables.paymentBatchEvents).toHaveBeenCalledWith(transaction)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('batchName', batches)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('agreementNumber', agreementNumbers)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ frn, schemeId })
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool when no transaction is provided and usesContractNumber is false', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      batches,
      agreementNumbers
    )

    expect(mockDb.tables.paymentBatchEvents).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool when no transaction is provided and usesContractNumber is true', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      batches,
      agreementNumbers
    )

    expect(mockDb.tables.paymentBatchEvents).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool when the transaction is null', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      batches,
      agreementNumbers,
      null
    )

    expect(mockDb.tables.paymentBatchEvents).toHaveBeenCalledWith(undefined)
  })

  test.each([
    ['empty batches', [], agreementNumbers],
    ['empty agreementNumbers', batches, []]
  ])(
    'returns without deleting when usesContractNumber is true and %s supplied',
    async (_, testIds, testAgreementNumbers) => {
      await removePaymentBatchEvents(
        agreementNumber,
        frn,
        schemeId,
        true,
        testIds,
        testAgreementNumbers,
        transaction
      )

      expect(mockDb.tables.paymentBatchEvents).not.toHaveBeenCalled()
      expect(mockDb.builder.del).not.toHaveBeenCalled()
    }
  )

  test('propagates database errors', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(
      removePaymentBatchEvents(
        agreementNumber,
        frn,
        schemeId,
        false,
        batches,
        agreementNumbers,
        transaction
      )
    ).rejects.toThrow('DB failure')
  })
})

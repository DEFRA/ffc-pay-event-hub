const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentFrnEvents'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removePaymentFRNEvents } = require('../../../app/retention/remove-payment-frn-events')

describe('removePaymentFRNEvents', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = mockDb.trx

  const correlationIds = ['corr-1', 'corr-2']
  const agreementNumbers = ['AGR123', 'AGR456']

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes by agreementNumber, frn and schemeId inside the transaction when usesContractNumber is false', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      correlationIds,
      agreementNumbers,
      transaction
    )

    expect(mockDb.tables.paymentFrnEvents).toHaveBeenCalledWith(transaction)
    expect(mockDb.builder.where).toHaveBeenCalledWith({
      agreementNumber,
      frn,
      schemeId
    })
    expect(mockDb.builder.whereIn).not.toHaveBeenCalled()
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('deletes by correlationId and agreementNumber lists inside the transaction when usesContractNumber is true', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      correlationIds,
      agreementNumbers,
      transaction
    )

    expect(mockDb.tables.paymentFrnEvents).toHaveBeenCalledWith(transaction)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('correlationId', correlationIds)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('agreementNumber', agreementNumbers)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ frn, schemeId })
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool when no transaction is provided and usesContractNumber is false', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      correlationIds,
      agreementNumbers
    )

    expect(mockDb.tables.paymentFrnEvents).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool when no transaction is provided and usesContractNumber is true', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      correlationIds,
      agreementNumbers
    )

    expect(mockDb.tables.paymentFrnEvents).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool when the transaction is null', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      correlationIds,
      agreementNumbers,
      null
    )

    expect(mockDb.tables.paymentFrnEvents).toHaveBeenCalledWith(undefined)
  })

  test.each([
    ['empty correlationIds', [], agreementNumbers],
    ['empty agreementNumbers', correlationIds, []]
  ])(
    'returns without deleting when usesContractNumber is true and %s supplied',
    async (_, testIds, testAgreementNumbers) => {
      await removePaymentFRNEvents(
        agreementNumber,
        frn,
        schemeId,
        true,
        testIds,
        testAgreementNumbers,
        transaction
      )

      expect(mockDb.tables.paymentFrnEvents).not.toHaveBeenCalled()
      expect(mockDb.builder.del).not.toHaveBeenCalled()
    }
  )

  test('propagates database errors', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(
      removePaymentFRNEvents(
        agreementNumber,
        frn,
        schemeId,
        false,
        correlationIds,
        agreementNumbers,
        transaction
      )
    ).rejects.toThrow('DB failure')
  })
})

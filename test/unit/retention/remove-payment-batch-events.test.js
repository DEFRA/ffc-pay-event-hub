const db = require('../../../app/data')
const { removePaymentBatchEvents } = require('../../../app/retention/remove-payment-batch-events')

jest.mock('../../../app/data', () => ({
  paymentBatchEvents: {
    destroy: jest.fn()
  },
  Sequelize: {
    Op: {
      in: Symbol('in')
    }
  }
}))

describe('removePaymentBatchEvents', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  const batches = ['batch-1', 'batch-2']
  const agreementNumbers = ['AGR123', 'AGR456']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.paymentBatchEvents.destroy with agreementNumber when usesContractNumber is false', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      batches,
      agreementNumbers,
      transaction
    )

    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledTimes(1)
    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledWith({
      where: {
        agreementNumber,
        frn,
        schemeId
      },
      transaction
    })
  })

  test('calls db.paymentBatchEvents.destroy using batches and agreementNumbers when usesContractNumber is true', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      batches,
      agreementNumbers,
      transaction
    )

    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledTimes(1)
    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledWith({
      where: {
        batchName: {
          [db.Sequelize.Op.in]: batches
        },
        agreementNumber: {
          [db.Sequelize.Op.in]: agreementNumbers
        },
        frn,
        schemeId
      },
      transaction
    })
  })

  test('does not call destroy when usesContractNumber is true and batches is empty', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      [],
      agreementNumbers,
      transaction
    )

    expect(db.paymentBatchEvents.destroy).not.toHaveBeenCalled()
  })

  test('does not call destroy when usesContractNumber is true and agreementNumbers is empty', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      batches,
      [],
      transaction
    )

    expect(db.paymentBatchEvents.destroy).not.toHaveBeenCalled()
  })

  test('calls destroy with undefined transaction when not provided and usesContractNumber is false', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      batches,
      agreementNumbers
    )

    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledWith({
      where: {
        agreementNumber,
        frn,
        schemeId
      },
      transaction: undefined
    })
  })

  test('calls destroy with undefined transaction when not provided and usesContractNumber is true', async () => {
    await removePaymentBatchEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      batches,
      agreementNumbers
    )

    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledWith({
      where: {
        batchName: {
          [db.Sequelize.Op.in]: batches
        },
        agreementNumber: {
          [db.Sequelize.Op.in]: agreementNumbers
        },
        frn,
        schemeId
      },
      transaction: undefined
    })
  })

  test.each([
    ['empty batches', [], agreementNumbers],
    ['empty agreementNumbers', batches, []]
  ])(
    'returns without destroying when usesContractNumber is true and %s supplied',
    async (_, testBatches, testAgreementNumbers) => {
      await removePaymentBatchEvents(
        agreementNumber,
        frn,
        schemeId,
        true,
        testBatches,
        testAgreementNumbers,
        transaction
      )

      expect(db.paymentBatchEvents.destroy).not.toHaveBeenCalled()
    }
  )

  test('propagates errors from db.paymentBatchEvents.destroy', async () => {
    const error = new Error('DB failure')
    db.paymentBatchEvents.destroy.mockRejectedValue(error)

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

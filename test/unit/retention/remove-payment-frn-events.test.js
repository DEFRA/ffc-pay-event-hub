const db = require('../../../app/data')
const { removePaymentFRNEvents } = require('../../../app/retention/remove-payment-frn-events')

jest.mock('../../../app/data', () => ({
  paymentFrnEvents: {
    destroy: jest.fn()
  },
  Sequelize: {
    Op: {
      in: Symbol('in')
    }
  }
}))

describe('removePaymentFRNEvents', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  const correlationIds = ['corr-1', 'corr-2']
  const agreementNumbers = ['AGR123', 'AGR456']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.paymentFrnEvents.destroy with agreementNumber when usesContractNumber is false', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      correlationIds,
      agreementNumbers,
      transaction
    )

    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledTimes(1)
    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledWith({
      where: {
        agreementNumber,
        frn,
        schemeId
      },
      transaction
    })
  })

  test('calls db.paymentFrnEvents.destroy using correlationIds and agreementNumbers when usesContractNumber is true', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      correlationIds,
      agreementNumbers,
      transaction
    )

    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledTimes(1)
    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledWith({
      where: {
        correlationId: {
          [db.Sequelize.Op.in]: correlationIds
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

  test('calls destroy with undefined transaction when not provided and usesContractNumber is false', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      false,
      correlationIds,
      agreementNumbers
    )

    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledWith({
      where: {
        agreementNumber,
        frn,
        schemeId
      },
      transaction: undefined
    })
  })

  test('calls destroy with undefined transaction when not provided and usesContractNumber is true', async () => {
    await removePaymentFRNEvents(
      agreementNumber,
      frn,
      schemeId,
      true,
      correlationIds,
      agreementNumbers
    )

    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledWith({
      where: {
        correlationId: {
          [db.Sequelize.Op.in]: correlationIds
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
    ['empty correlationIds', [], agreementNumbers],
    ['empty agreementNumbers', correlationIds, []]
  ])(
    'returns without destroying when usesContractNumber is true and %s supplied',
    async (_, testCorrelationIds, testAgreementNumbers) => {
      await removePaymentFRNEvents(
        agreementNumber,
        frn,
        schemeId,
        true,
        testCorrelationIds,
        testAgreementNumbers,
        transaction
      )

      expect(db.paymentFrnEvents.destroy).not.toHaveBeenCalled()
    }
  )

  test('propagates errors from db.paymentFrnEvents.destroy', async () => {
    const error = new Error('DB failure')
    db.paymentFrnEvents.destroy.mockRejectedValue(error)

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

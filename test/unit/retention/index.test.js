const { removeAgreementData } = require('../../../app/retention')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  sequelize: {
    transaction: jest.fn()
  }
}))

jest.mock('../../../app/retention/remove-payment-batch-events', () => ({
  removePaymentBatchEvents: jest.fn()
}))

jest.mock('../../../app/retention/remove-payment-frn-events', () => ({
  removePaymentFRNEvents: jest.fn()
}))

jest.mock('../../../app/retention/remove-payments', () => ({
  removePayments: jest.fn()
}))

jest.mock('../../../app/retention/remove-warnings', () => ({
  removeWarnings: jest.fn()
}))

const { removePaymentBatchEvents } = require('../../../app/retention/remove-payment-batch-events')
const { removePaymentFRNEvents } = require('../../../app/retention/remove-payment-frn-events')
const { removePayments } = require('../../../app/retention/remove-payments')
const { removeWarnings } = require('../../../app/retention/remove-warnings')

describe('removeAgreementData', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const retentionData = {
    agreementNumber,
    frn,
    schemeId
  }
  let transaction

  beforeEach(() => {
    jest.clearAllMocks()

    transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    }
    db.sequelize.transaction.mockResolvedValue(transaction)
  })

  test('removes data from all tables', async () => {
    removePaymentBatchEvents.mockResolvedValue()
    removePaymentFRNEvents.mockResolvedValue()
    removePayments.mockResolvedValue()
    removeWarnings.mockResolvedValue()

    await removeAgreementData(retentionData)

    expect(db.sequelize.transaction).toHaveBeenCalledTimes(1)
    expect(removeWarnings).toHaveBeenCalledWith(agreementNumber, frn, schemeId, transaction)
    expect(removePaymentBatchEvents).toHaveBeenCalledWith(agreementNumber, frn, schemeId, transaction)
    expect(removePaymentFRNEvents).toHaveBeenCalledWith(agreementNumber, frn, schemeId, transaction)
    expect(removePayments).toHaveBeenCalledWith(agreementNumber, frn, schemeId, transaction)
    expect(transaction.commit).toHaveBeenCalledTimes(1)
    expect(transaction.rollback).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removeWarnings throws', async () => {
    const error = new Error('removeWarnings failure')
    removeWarnings.mockRejectedValue(error)

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removeWarnings failure')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removePaymentBatchEvents throws', async () => {
    removeWarnings.mockResolvedValue()
    removePaymentBatchEvents.mockRejectedValue(new Error('removePaymentBatchEvents error'))

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removePaymentBatchEvents error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removePaymentFRNEvents throws', async () => {
    removeWarnings.mockResolvedValue()
    removePaymentBatchEvents.mockResolvedValue()
    removePaymentFRNEvents.mockRejectedValue(new Error('removePaymentFRNEvents error'))

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removePaymentFRNEvents error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removePayments throws', async () => {
    removeWarnings.mockResolvedValue()
    removePaymentBatchEvents.mockResolvedValue()
    removePaymentFRNEvents.mockResolvedValue()
    removePayments.mockRejectedValue(new Error('removePayments error'))

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removePayments error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })
})

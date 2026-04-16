const db = require('../../../app/data')
const { removePaymentBatchEvents } = require('../../../app/retention/remove-payment-batch-events')

jest.mock('../../../app/data', () => ({
  paymentBatchEvents: {
    destroy: jest.fn()
  }
}))

describe('removePaymentBatchEvents', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.paymentBatchEvents.destroy with correct parameters', async () => {
    await removePaymentBatchEvents(agreementNumber, frn, schemeId, transaction)

    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledTimes(1)
    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledWith({
      where: { agreementNumber, frn, schemeId },
      transaction
    })
  })

  test('calls db.paymentBatchEvents.destroy with undefined transaction if not provided', async () => {
    await removePaymentBatchEvents(agreementNumber, frn, schemeId)

    expect(db.paymentBatchEvents.destroy).toHaveBeenCalledWith({
      where: { agreementNumber, frn, schemeId },
      transaction: undefined
    })
  })

  test('propagates errors from db.paymentBatchEvents.destroy', async () => {
    const error = new Error('DB failure')
    db.paymentBatchEvents.destroy.mockRejectedValue(error)

    await expect(removePaymentBatchEvents(agreementNumber, frn, schemeId, transaction)).rejects.toThrow('DB failure')
  })
})

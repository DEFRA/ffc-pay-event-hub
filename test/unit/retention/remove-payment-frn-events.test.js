const db = require('../../../app/data')
const { removePaymentFRNEvents } = require('../../../app/retention/remove-payment-frn-events')

jest.mock('../../../app/data', () => ({
  paymentFrnEvents: {
    destroy: jest.fn()
  }
}))

describe('removePaymentFRNEvents', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.paymentFrnEvents.destroy with correct parameters', async () => {
    await removePaymentFRNEvents(agreementNumber, frn, schemeId, transaction)

    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledTimes(1)
    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledWith({
      where: { agreementNumber, frn, schemeId },
      transaction
    })
  })

  test('calls db.paymentFrnEvents.destroy with undefined transaction if not provided', async () => {
    await removePaymentFRNEvents(agreementNumber, frn, schemeId)

    expect(db.paymentFrnEvents.destroy).toHaveBeenCalledWith({
      where: { agreementNumber, frn, schemeId },
      transaction: undefined
    })
  })

  test('propagates errors from db.paymentFrnEvents.destroy', async () => {
    const error = new Error('DB failure')
    db.paymentFrnEvents.destroy.mockRejectedValue(error)

    await expect(removePaymentFRNEvents(agreementNumber, frn, schemeId, transaction)).rejects.toThrow('DB failure')
  })
})

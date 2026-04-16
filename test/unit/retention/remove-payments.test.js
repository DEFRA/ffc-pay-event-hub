const db = require('../../../app/data')
const { removePayments } = require('../../../app/retention/remove-payments')

jest.mock('../../../app/data', () => ({
  payments: {
    destroy: jest.fn()
  },
  sequelize: {
    Op: {
      and: jest.fn()
    }
  }
}))

describe('removePayments', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.payments.destroy with correct parameters', async () => {
    await removePayments(agreementNumber, frn, schemeId, transaction)

    expect(db.payments.destroy).toHaveBeenCalledTimes(1)
    expect(db.payments.destroy).toHaveBeenCalledWith({
      where: {
        [db.sequelize.Op.and]: [
          { 'data.agreementNumber': agreementNumber },
          { 'data.frn': frn },
          { 'data.schemeId': schemeId }
        ]
      },
      transaction
    })
  })

  test('calls db.payments.destroy with undefined transaction if not provided', async () => {
    await removePayments(agreementNumber, frn, schemeId)

    expect(db.payments.destroy).toHaveBeenCalledWith({
      where: {
        [db.sequelize.Op.and]: [
          { 'data.agreementNumber': agreementNumber },
          { 'data.frn': frn },
          { 'data.schemeId': schemeId }
        ]
      },
      transaction: undefined
    })
  })

  test('propagates errors from db.payments.destroy', async () => {
    const error = new Error('DB failure')
    db.payments.destroy.mockRejectedValue(error)

    await expect(removePayments(agreementNumber, frn, schemeId, transaction)).rejects.toThrow('DB failure')
  })
})

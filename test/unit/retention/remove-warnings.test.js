const db = require('../../../app/data')
const { removeWarnings } = require('../../../app/retention/remove-warnings')

jest.mock('../../../app/data', () => ({
  warnings: {
    destroy: jest.fn()
  },
  sequelize: {
    Op: {
      and: jest.fn()
    }
  }
}))

describe('removeWarnings', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.warnings.destroy with correct parameters', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, transaction)

    expect(db.warnings.destroy).toHaveBeenCalledTimes(1)
    expect(db.warnings.destroy).toHaveBeenCalledWith({
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

  test('calls db.warnings.destroy with undefined transaction if not provided', async () => {
    await removeWarnings(agreementNumber, frn, schemeId)

    expect(db.warnings.destroy).toHaveBeenCalledWith({
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

  test('propagates errors from db.warnings.destroy', async () => {
    const error = new Error('DB failure')
    db.warnings.destroy.mockRejectedValue(error)

    await expect(removeWarnings(agreementNumber, frn, schemeId, transaction)).rejects.toThrow('DB failure')
  })
})

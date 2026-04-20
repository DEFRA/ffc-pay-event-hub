const db = require('../../../app/data')
const { removeWarnings } = require('../../../app/retention/remove-warnings')

jest.mock('../../../app/data', () => ({
  warnings: {
    destroy: jest.fn()
  },
  sequelize: {
    Op: {
      and: Symbol('and')
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

  test('calls db.warnings.destroy with agreementNumber in where when usesContractNumber is false or omitted', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, false, transaction)

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

  test('calls db.warnings.destroy with contractNumber in where when usesContractNumber is true', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, true, transaction)

    expect(db.warnings.destroy).toHaveBeenCalledTimes(1)
    expect(db.warnings.destroy).toHaveBeenCalledWith({
      where: {
        [db.sequelize.Op.and]: [
          { 'data.contractNumber': agreementNumber },
          { 'data.frn': frn },
          { 'data.schemeId': schemeId }
        ]
      },
      transaction
    })
  })

  test('calls db.warnings.destroy with undefined transaction if not provided, usesContractNumber false', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, false)

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

  test('calls db.warnings.destroy with undefined transaction if not provided, usesContractNumber true', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, true)

    expect(db.warnings.destroy).toHaveBeenCalledWith({
      where: {
        [db.sequelize.Op.and]: [
          { 'data.contractNumber': agreementNumber },
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

    await expect(removeWarnings(agreementNumber, frn, schemeId, false, transaction)).rejects.toThrow('DB failure')
  })
})

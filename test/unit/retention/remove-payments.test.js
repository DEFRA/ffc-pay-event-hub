const db = require('../../../app/data')
const { removePayments } = require('../../../app/retention/remove-payments')

jest.mock('../../../app/data', () => {
  const sequelizeWhereMock = jest.fn()
  const sequelizeJsonMock = jest.fn((path) => path)

  return {
    payments: {
      destroy: jest.fn()
    },
    sequelize: {
      Op: {
        and: Symbol('and')
      },
      where: sequelizeWhereMock,
      json: sequelizeJsonMock
    }
  }
})

describe('removePayments', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.payments.destroy with agreementNumber in where when usesContractNumber is false or omitted', async () => {
    await removePayments(agreementNumber, frn, schemeId, false, transaction)

    const { sequelize } = db
    const destroyCallArg = db.payments.destroy.mock.calls[0][0]

    expect(sequelize.json).toHaveBeenCalledWith('data.agreementNumber')
    expect(sequelize.json).toHaveBeenCalledWith('data.frn')
    expect(sequelize.json).toHaveBeenCalledWith('data.schemeId')

    expect(sequelize.where).toHaveBeenCalledWith('data.agreementNumber', agreementNumber)
    expect(sequelize.where).toHaveBeenCalledWith('data.frn', frn)
    expect(sequelize.where).toHaveBeenCalledWith('data.schemeId', schemeId)

    expect(db.payments.destroy).toHaveBeenCalledTimes(1)
    expect(destroyCallArg).toHaveProperty('where')

    const symbols = Object.getOwnPropertySymbols(destroyCallArg.where)
    expect(symbols).toContain(db.Sequelize.Op.and)

    expect(destroyCallArg.where[db.Sequelize.Op.and]).toEqual(sequelize.where.mock.results.map(r => r.value))
    expect(destroyCallArg.transaction).toBe(transaction)
  })

  test('calls db.payments.destroy with contractNumber in where when usesContractNumber is true', async () => {
    await removePayments(agreementNumber, frn, schemeId, true, transaction)

    const { sequelize } = db
    const destroyCallArg = db.payments.destroy.mock.calls[0][0]

    expect(sequelize.json).toHaveBeenCalledWith('data.contractNumber')
    expect(sequelize.json).toHaveBeenCalledWith('data.frn')
    expect(sequelize.json).toHaveBeenCalledWith('data.schemeId')

    expect(sequelize.where).toHaveBeenCalledWith('data.contractNumber', agreementNumber)
    expect(sequelize.where).toHaveBeenCalledWith('data.frn', frn)
    expect(sequelize.where).toHaveBeenCalledWith('data.schemeId', schemeId)

    expect(db.payments.destroy).toHaveBeenCalledTimes(1)

    const symbols = Object.getOwnPropertySymbols(destroyCallArg.where)
    expect(symbols).toContain(db.Sequelize.Op.and)

    expect(destroyCallArg.where[db.Sequelize.Op.and]).toEqual(sequelize.where.mock.results.map(r => r.value))
    expect(destroyCallArg.transaction).toBe(transaction)
  })

  test('calls db.payments.destroy with undefined transaction if not provided, usesContractNumber false', async () => {
    await removePayments(agreementNumber, frn, schemeId, false)

    const destroyCallArg = db.payments.destroy.mock.calls[0][0]
    expect(destroyCallArg.transaction).toBeUndefined()
  })

  test('calls db.payments.destroy with undefined transaction if not provided, usesContractNumber true', async () => {
    await removePayments(agreementNumber, frn, schemeId, true)

    const destroyCallArg = db.payments.destroy.mock.calls[0][0]
    expect(destroyCallArg.transaction).toBeUndefined()
  })

  test('propagates errors from db.payments.destroy', async () => {
    const error = new Error('DB failure')
    db.payments.destroy.mockRejectedValue(error)

    await expect(removePayments(agreementNumber, frn, schemeId, false, transaction)).rejects.toThrow('DB failure')
  })
})

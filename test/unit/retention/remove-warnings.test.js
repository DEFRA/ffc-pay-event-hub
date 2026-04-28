const db = require('../../../app/data')
const { removeWarnings } = require('../../../app/retention/remove-warnings')

jest.mock('../../../app/data', () => {
  const sequelizeWhereMock = jest.fn()
  const sequelizeJsonMock = jest.fn((path) => path)
  const sequelizeLiteralMock = jest.fn((sql) => ({ _sql: sql }))

  return {
    warnings: {
      destroy: jest.fn()
    },
    sequelize: {
      Op: {
        and: Symbol('and')
      },
      json: sequelizeJsonMock,
      literal: sequelizeLiteralMock
    },
    Sequelize: {
      Op: {
        and: Symbol('and')
      },
      where: sequelizeWhereMock,
      literal: sequelizeLiteralMock
    }
  }
})

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

    const { sequelize, Sequelize } = db
    const destroyCallArg = db.warnings.destroy.mock.calls[0][0]

    expect(sequelize.json).toHaveBeenCalledWith('data.agreementNumber')
    expect(Sequelize.where).toHaveBeenCalledWith('data.agreementNumber', agreementNumber)

    expect(sequelize.json).not.toHaveBeenCalledWith('data.frn')
    expect(sequelize.json).not.toHaveBeenCalledWith('data.schemeId')

    expect(sequelize.literal).toHaveBeenCalledWith("(data->>'frn')::int")
    expect(sequelize.literal).toHaveBeenCalledWith("(data->>'schemeId')::int")

    expect(Sequelize.where).toHaveBeenCalledWith(
      expect.objectContaining({ _sql: "(data->>'frn')::int" }),
      frn
    )
    expect(Sequelize.where).toHaveBeenCalledWith(
      expect.objectContaining({ _sql: "(data->>'schemeId')::int" }),
      schemeId
    )

    expect(db.warnings.destroy).toHaveBeenCalledTimes(1)
    expect(destroyCallArg).toHaveProperty('where')

    const symbols = Object.getOwnPropertySymbols(destroyCallArg.where)
    expect(symbols).toContain(db.Sequelize.Op.and)

    expect(destroyCallArg.where[db.Sequelize.Op.and]).toEqual(Sequelize.where.mock.results.map(r => r.value))
    expect(destroyCallArg.transaction).toBe(transaction)
  })

  test('calls db.warnings.destroy with contractNumber in where when usesContractNumber is true', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, true, transaction)

    const { sequelize, Sequelize } = db
    const destroyCallArg = db.warnings.destroy.mock.calls[0][0]

    expect(sequelize.json).toHaveBeenCalledWith('data.contractNumber')
    expect(Sequelize.where).toHaveBeenCalledWith('data.contractNumber', agreementNumber)

    expect(sequelize.json).not.toHaveBeenCalledWith('data.frn')
    expect(sequelize.json).not.toHaveBeenCalledWith('data.schemeId')

    expect(sequelize.literal).toHaveBeenCalledWith("(data->>'frn')::int")
    expect(sequelize.literal).toHaveBeenCalledWith("(data->>'schemeId')::int")

    expect(Sequelize.where).toHaveBeenCalledWith(
      expect.objectContaining({ _sql: "(data->>'frn')::int" }),
      frn
    )
    expect(Sequelize.where).toHaveBeenCalledWith(
      expect.objectContaining({ _sql: "(data->>'schemeId')::int" }),
      schemeId
    )

    expect(db.warnings.destroy).toHaveBeenCalledTimes(1)

    const symbols = Object.getOwnPropertySymbols(destroyCallArg.where)
    expect(symbols).toContain(db.Sequelize.Op.and)

    expect(destroyCallArg.where[db.Sequelize.Op.and]).toEqual(Sequelize.where.mock.results.map(r => r.value))
    expect(destroyCallArg.transaction).toBe(transaction)
  })

  test('calls db.warnings.destroy with undefined transaction if not provided, usesContractNumber false', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, false)

    const destroyCallArg = db.warnings.destroy.mock.calls[0][0]
    expect(destroyCallArg.transaction).toBeUndefined()
  })

  test('calls db.warnings.destroy with undefined transaction if not provided, usesContractNumber true', async () => {
    await removeWarnings(agreementNumber, frn, schemeId, true)

    const destroyCallArg = db.warnings.destroy.mock.calls[0][0]
    expect(destroyCallArg.transaction).toBeUndefined()
  })

  test('propagates errors from db.warnings.destroy', async () => {
    const error = new Error('DB failure')
    db.warnings.destroy.mockRejectedValue(error)

    await expect(removeWarnings(agreementNumber, frn, schemeId, false, transaction)).rejects.toThrow('DB failure')
  })
})

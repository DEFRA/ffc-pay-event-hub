jest.mock('../../../app/data', () => {
  const sequelizeWhereMock = jest.fn()
  const sequelizeJsonMock = jest.fn(path => path)
  const sequelizeLiteralMock = jest.fn(sql => ({ _sql: sql }))

  return {
    payments: {
      findAll: jest.fn(),
      destroy: jest.fn()
    },
    sequelize: {
      json: sequelizeJsonMock
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

const db = require('../../../app/data')
const { removePayments } = require('../../../app/retention/remove-payments')

describe('removePayments', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()

    db.payments.findAll.mockResolvedValue([])
    db.payments.destroy.mockResolvedValue()
  })

  test('calls db.payments.destroy with agreementNumber in where when usesContractNumber is false', async () => {
    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      false,
      transaction
    )

    const { sequelize, Sequelize } = db
    const destroyCallArg = db.payments.destroy.mock.calls[0][0]

    expect(sequelize.json).toHaveBeenCalledWith('data.agreementNumber')
    expect(Sequelize.where).toHaveBeenCalledWith(
      'data.agreementNumber',
      agreementNumber
    )

    expect(db.payments.findAll).not.toHaveBeenCalled()

    expect(db.payments.destroy).toHaveBeenCalledTimes(1)

    const symbols = Object.getOwnPropertySymbols(destroyCallArg.where)

    expect(symbols).toContain(db.Sequelize.Op.and)
    expect(
      destroyCallArg.where[db.Sequelize.Op.and]
    ).toEqual(Sequelize.where.mock.results.map(r => r.value))

    expect(destroyCallArg.transaction).toBe(transaction)

    expect(result).toEqual({
      batches: [],
      agreementNumbers: [],
      correlationIds: []
    })
  })

  test('finds related payment data, removes payments and returns unique values when usesContractNumber is true', async () => {
    db.payments.findAll.mockResolvedValue([
      {
        batch: 'batch-1',
        agreementNumber: 'AGR001',
        correlationId: 'corr-1'
      },
      {
        batch: 'batch-1',
        agreementNumber: 'AGR001',
        correlationId: 'corr-1'
      },
      {
        batch: 'batch-2',
        agreementNumber: 'AGR002',
        correlationId: 'corr-2'
      }
    ])

    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      true,
      transaction
    )

    const { sequelize, Sequelize } = db
    const destroyCallArg = db.payments.destroy.mock.calls[0][0]

    expect(sequelize.json).toHaveBeenCalledWith('data.contractNumber')
    expect(Sequelize.where).toHaveBeenCalledWith(
      'data.contractNumber',
      agreementNumber
    )

    expect(db.payments.findAll).toHaveBeenCalledTimes(1)
    expect(db.payments.findAll).toHaveBeenCalledWith({
      attributes: [
        [
          expect.objectContaining({ _sql: "data->>'batch'" }),
          'batch'
        ],
        [
          expect.objectContaining({ _sql: "data->>'agreementNumber'" }),
          'agreementNumber'
        ],
        [
          expect.objectContaining({ _sql: "data->>'correlationId'" }),
          'correlationId'
        ]
      ],
      where: destroyCallArg.where,
      raw: true,
      transaction
    })

    expect(db.payments.destroy).toHaveBeenCalledTimes(1)

    expect(result).toEqual({
      batches: ['batch-1', 'batch-2'],
      agreementNumbers: ['AGR001', 'AGR002'],
      correlationIds: ['corr-1', 'corr-2']
    })
  })

  test('filters null and undefined values from returned arrays', async () => {
    db.payments.findAll.mockResolvedValue([
      {
        batch: 'batch-1',
        agreementNumber: 'AGR001',
        correlationId: 'corr-1'
      },
      {
        batch: null,
        agreementNumber: undefined,
        correlationId: ''
      }
    ])

    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      true,
      transaction
    )

    expect(result).toEqual({
      batches: ['batch-1'],
      agreementNumbers: ['AGR001'],
      correlationIds: ['corr-1']
    })
  })

  test('calls db.payments.destroy with undefined transaction if not provided', async () => {
    await removePayments(
      agreementNumber,
      frn,
      schemeId,
      false
    )

    const destroyCallArg = db.payments.destroy.mock.calls[0][0]

    expect(destroyCallArg.transaction).toBeUndefined()
  })

  test('propagates errors from db.payments.findAll', async () => {
    const error = new Error('findAll failure')

    db.payments.findAll.mockRejectedValue(error)

    await expect(
      removePayments(
        agreementNumber,
        frn,
        schemeId,
        true,
        transaction
      )
    ).rejects.toThrow('findAll failure')
  })

  test('propagates errors from db.payments.destroy', async () => {
    const error = new Error('DB failure')

    db.payments.destroy.mockRejectedValue(error)

    await expect(
      removePayments(
        agreementNumber,
        frn,
        schemeId,
        false,
        transaction
      )
    ).rejects.toThrow('DB failure')
  })

  test('returns empty arrays when no matching payments are found', async () => {
    db.payments.findAll.mockResolvedValue([])

    const result = await removePayments(
      agreementNumber,
      frn,
      schemeId,
      true,
      transaction
    )

    expect(result).toEqual({
      batches: [],
      agreementNumbers: [],
      correlationIds: []
    })
  })
})

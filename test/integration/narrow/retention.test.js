const mockFailFrnEvents = { value: false }

jest.mock('../../../app/retention/remove-payment-frn-events', () => {
  const actual = jest.requireActual('../../../app/retention/remove-payment-frn-events')
  return {
    removePaymentFRNEvents: async (...args) => {
      if (mockFailFrnEvents.value) {
        throw new Error('forced failure')
      }
      return actual.removePaymentFRNEvents(...args)
    }
  }
})

const { randomUUID } = require('node:crypto')
const { getSchemeIds } = require('ffc-pay-schemes')
const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const { removeAgreementData } = require('../../../app/retention')

const { SFI, CS, MANUAL } = getSchemeIds()

const createPayment = (partitionKey, category, data) => ({
  id: randomUUID(),
  partitionKey,
  rowKey: `${data.correlationId}|${data.invoiceNumber}`,
  type: 'uk.gov.defra.ffc.pay.payment.extracted',
  time: new Date().toISOString(),
  category,
  data: JSON.stringify(data)
})

const createWarning = (data) => ({
  id: randomUUID(),
  partitionKey: 'warning',
  rowKey: randomUUID(),
  type: 'uk.gov.defra.ffc.pay.warning.event',
  time: new Date().toISOString(),
  category: 'warning',
  data: JSON.stringify(data)
})

const seedPayment = async (data) => {
  await db.payments().insert([
    createPayment(String(data.frn), 'frn', data),
    createPayment(data.batch, 'batch', data)
  ])
}

const agreementRows = async (agreementNumber) => ({
  payments: await db.payments().whereRaw('"data" #>> \'{agreementNumber}\' = ?', [agreementNumber]),
  warnings: await db.warnings().whereRaw('"data" #>> \'{agreementNumber}\' = ?', [agreementNumber]),
  paymentBatchEvents: await db.paymentBatchEvents().where({ agreementNumber }),
  paymentFrnEvents: await db.paymentFrnEvents().where({ agreementNumber })
})

describe('removeAgreementData against Postgres', () => {
  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('removes an agreement from every table when frn and schemeId are numbers', async () => {
    const payment = { frn: 1234567890, schemeId: SFI, agreementNumber: 'AG1', correlationId: 'c1', batch: 'b1', invoiceNumber: 'INV1', value: 100 }
    const other = { ...payment, agreementNumber: 'AG2', correlationId: 'c2', batch: 'b2', invoiceNumber: 'INV2' }
    await seedPayment(payment)
    await seedPayment(other)
    await db.warnings().insert([
      createWarning({ frn: payment.frn, schemeId: SFI, agreementNumber: 'AG1' }),
      createWarning({ frn: payment.frn, schemeId: SFI, agreementNumber: 'AG2' })
    ])

    const before = await agreementRows('AG1')
    expect(before.payments).toHaveLength(2)
    expect(before.warnings).toHaveLength(1)
    expect(before.paymentBatchEvents).toHaveLength(1)
    expect(before.paymentFrnEvents).toHaveLength(1)

    await removeAgreementData({ agreementNumber: 'AG1', frn: payment.frn, schemeId: SFI, usesContractNumber: false })

    const removed = await agreementRows('AG1')
    expect(removed.payments).toHaveLength(0)
    expect(removed.warnings).toHaveLength(0)
    expect(removed.paymentBatchEvents).toHaveLength(0)
    expect(removed.paymentFrnEvents).toHaveLength(0)

    const kept = await agreementRows('AG2')
    expect(kept.payments).toHaveLength(2)
    expect(kept.warnings).toHaveLength(1)
    expect(kept.paymentBatchEvents).toHaveLength(1)
    expect(kept.paymentFrnEvents).toHaveLength(1)
  })

  test('removes an agreement when frn and schemeId are strings', async () => {
    const payment = { frn: 1234567890, schemeId: SFI, agreementNumber: 'AG1', correlationId: 'c1', batch: 'b1', invoiceNumber: 'INV1', value: 100 }
    await seedPayment(payment)

    await removeAgreementData({ agreementNumber: 'AG1', frn: '1234567890', schemeId: String(SFI), usesContractNumber: false })

    const removed = await agreementRows('AG1')
    expect(removed.payments).toHaveLength(0)
    expect(removed.paymentBatchEvents).toHaveLength(0)
    expect(removed.paymentFrnEvents).toHaveLength(0)
  })

  test('uses the batch, agreement and correlation values selected from payments when the scheme uses contract numbers', async () => {
    const payment = { frn: 1111111111, schemeId: CS, contractNumber: 'CN1', agreementNumber: 'AG5', correlationId: 'c5', batch: 'b5', invoiceNumber: 'INV5', value: 100 }
    const other = { ...payment, contractNumber: 'CN2', agreementNumber: 'AG6', correlationId: 'c6', batch: 'b6', invoiceNumber: 'INV6' }
    await seedPayment(payment)
    await seedPayment(other)
    await db.warnings().insert(createWarning({ frn: payment.frn, schemeId: CS, contractNumber: 'CN1' }))

    await removeAgreementData({ agreementNumber: 'CN1', frn: payment.frn, schemeId: CS, usesContractNumber: true })

    const removed = await agreementRows('AG5')
    expect(removed.payments).toHaveLength(0)
    expect(removed.paymentBatchEvents).toHaveLength(0)
    expect(removed.paymentFrnEvents).toHaveLength(0)
    expect(await db.warnings()).toHaveLength(0)

    const kept = await agreementRows('AG6')
    expect(kept.payments).toHaveLength(2)
    expect(kept.paymentBatchEvents).toHaveLength(1)
    expect(kept.paymentFrnEvents).toHaveLength(1)
  })

  test('only removes the matching pillar for the manual scheme', async () => {
    const p1 = { frn: 1222222222, schemeId: MANUAL, agreementNumber: 'AG8', pillar: 'P1', correlationId: 'c8', batch: 'b8', invoiceNumber: 'INV8', value: 100 }
    const p2 = { ...p1, pillar: 'P2', correlationId: 'c9', batch: 'b9', invoiceNumber: 'INV9' }
    await seedPayment(p1)
    await seedPayment(p2)
    await db.warnings().insert([
      createWarning({ frn: p1.frn, schemeId: MANUAL, agreementNumber: 'AG8', pillar: 'P1' }),
      createWarning({ frn: p1.frn, schemeId: MANUAL, agreementNumber: 'AG8', pillar: 'P2' })
    ])

    await removeAgreementData({ agreementNumber: 'AG8', frn: p1.frn, schemeId: MANUAL, usesContractNumber: false, pillar: 'P1' })

    const payments = await db.payments()
    expect(payments).toHaveLength(2)
    payments.forEach(payment => expect(payment.data.pillar).toBe('P2'))

    const warnings = await db.warnings()
    expect(warnings).toHaveLength(1)
    expect(warnings[0].data.pillar).toBe('P2')
  })

  test('rolls back every removal when a later step fails', async () => {
    const payment = { frn: 1234567890, schemeId: SFI, agreementNumber: 'AG1', correlationId: 'c1', batch: 'b1', invoiceNumber: 'INV1', value: 100 }
    await seedPayment(payment)
    await db.warnings().insert(createWarning({ frn: payment.frn, schemeId: SFI, agreementNumber: 'AG1' }))

    mockFailFrnEvents.value = true
    try {
      await expect(removeAgreementData({ agreementNumber: 'AG1', frn: payment.frn, schemeId: SFI, usesContractNumber: false }))
        .rejects.toThrow('forced failure')
    } finally {
      mockFailFrnEvents.value = false
    }

    const kept = await agreementRows('AG1')
    expect(kept.payments).toHaveLength(2)
    expect(kept.warnings).toHaveLength(1)
    expect(kept.paymentBatchEvents).toHaveLength(1)
    expect(kept.paymentFrnEvents).toHaveLength(1)
  })
})

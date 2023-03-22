const { FRN, SCHEME_ID, CORRELATION_ID, BATCH } = require('../../../../app/constants/categories')
const { PAYMENT_EVENT } = require('../../../../app/constants/event-types')

jest.mock('../../../../app/storage')
const { getClient: mockGetClient } = require('../../../../app/storage')

const mockCreateEntity = jest.fn()
const mockClient = {
  createEntity: mockCreateEntity
}
mockGetClient.mockReturnValue(mockClient)

jest.mock('../../../../app/inbound/save-event/create-entity')
const { createEntity: mockCreatePaymentEntity } = require('../../../../app/inbound/save-event/create-entity')

const paymentEntity = {
  partitionKey: 'mock-partition-key',
  rowKey: 'mock-row-key'
}
mockCreatePaymentEntity.mockReturnValue(paymentEntity)

const { savePaymentEvent } = require('../../../../app/inbound/save-event/payment')

const event = require('../../../mocks/payment-event')

describe('save payment event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('uses hold client', async () => {
    await savePaymentEvent(event)
    expect(mockGetClient).toHaveBeenCalledWith(PAYMENT_EVENT)
  })

  test('creates three entities if no batch', async () => {
    await savePaymentEvent(event)
    expect(mockCreateEntity).toHaveBeenCalledTimes(3)
  })

  test('creates four entities if batch', async () => {
    event.data.batch = 'mock-batch'
    await savePaymentEvent(event)
    expect(mockCreateEntity).toHaveBeenCalledTimes(4)
  })

  test('creates entity frn category', async () => {
    await savePaymentEvent(event)
    expect(mockCreatePaymentEntity).toHaveBeenCalledWith(event.data.frn, event.data.correlationId, FRN, event)
  })

  test('creates entity scheme id category', async () => {
    await savePaymentEvent(event)
    expect(mockCreatePaymentEntity).toHaveBeenCalledWith(event.data.schemeId, event.data.frn, SCHEME_ID, event)
  })

  test('creates entity correlation id category', async () => {
    await savePaymentEvent(event)
    expect(mockCreatePaymentEntity).toHaveBeenCalledWith(event.data.correlationId, event.data.frn, CORRELATION_ID, event)
  })

  test('creates entity batch category if batch', async () => {
    event.data.batch = 'mock-batch'
    await savePaymentEvent(event)
    expect(mockCreatePaymentEntity).toHaveBeenCalledWith(event.data.batch, event.data.frn, BATCH, event)
  })
})

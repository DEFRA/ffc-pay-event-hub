const { FRN, SCHEME_ID, CORRELATION_ID, BATCH } = require('../../../../app/constants/categories')
const { PAYMENT_EVENT } = require('../../../../app/constants/event-types')

jest.mock('../../../../app/storage')
const { getClient: mockGetClient } = require('../../../../app/storage')

const mockUpsertEntity = jest.fn()
const mockClient = {
  upsertEntity: mockUpsertEntity
}
mockGetClient.mockReturnValue(mockClient)

jest.mock('../../../../app/inbound/save-event/create-row')
const { createRow: mockCreateRow } = require('../../../../app/inbound/save-event/create-row')

const paymentEntity = {
  partitionKey: 'mock-partition-key',
  rowKey: 'mock-row-key'
}
mockCreateRow.mockReturnValue(paymentEntity)

const { savePaymentEvent } = require('../../../../app/inbound/save-event/payment')

const event = require('../../../mocks/events/payment')

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
    expect(mockUpsertEntity).toHaveBeenCalledTimes(3)
  })

  test('creates four entities if batch', async () => {
    event.data.batch = 'mock-batch'
    await savePaymentEvent(event)
    expect(mockUpsertEntity).toHaveBeenCalledTimes(4)
  })

  test('creates entity frn category', async () => {
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(event.data.frn, `${event.data.correlationId}|${event.data.invoiceNumber}`, FRN, event)
  })

  test('creates entity scheme id category', async () => {
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(event.data.schemeId, `${event.data.frn}|${event.data.invoiceNumber}`, SCHEME_ID, event)
  })

  test('creates entity correlation id category', async () => {
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(event.data.correlationId, `${event.data.frn}|${event.data.invoiceNumber}`, CORRELATION_ID, event)
  })

  test('creates entity batch category if batch', async () => {
    event.data.batch = 'mock-batch'
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(event.data.batch, `${event.data.frn}|${event.data.invoiceNumber}`, BATCH, event)
  })
})

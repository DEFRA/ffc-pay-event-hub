const { FRN, SCHEME_ID, CORRELATION_ID, BATCH } = require('../../../../app/constants/categories')
const { PAYMENT_EVENT } = require('../../../../app/constants/event-types')

jest.mock('../../../../app/storage')
const { getClient: mockGetClient } = require('../../../../app/storage')

const mockUpsertEntity = jest.fn()
const mockClient = { upsertEntity: mockUpsertEntity }
mockGetClient.mockReturnValue(mockClient)

jest.mock('../../../../app/inbound/save-event/create-row')
const { createRow: mockCreateRow } = require('../../../../app/inbound/save-event/create-row')

const paymentEntity = { partitionKey: 'mock-partition-key', rowKey: 'mock-row-key' }
mockCreateRow.mockReturnValue(paymentEntity)

const { savePaymentEvent } = require('../../../../app/inbound/save-event/payment')
const event = require('../../../mocks/events/payment')

describe('save payment event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete event.data.batch
  })

  test('uses payment client', async () => {
    await savePaymentEvent(event)
    expect(mockGetClient).toHaveBeenCalledWith(PAYMENT_EVENT)
  })

  test.each([
    ['no batch', undefined, 3],
    ['with batch', 'mock-batch', 4]
  ])('creates correct number of entities %s', async (_, batchValue, expectedCalls) => {
    event.data.batch = batchValue
    await savePaymentEvent(event)
    expect(mockUpsertEntity).toHaveBeenCalledTimes(expectedCalls)
  })

  test.each([
    ['FRN', event.data.frn, `${event.data.correlationId}|${event.data.invoiceNumber}`, FRN],
    ['SchemeId', event.data.schemeId, `${event.data.frn}|${event.data.invoiceNumber}`, SCHEME_ID],
    ['CorrelationId', event.data.correlationId, `${event.data.frn}|${event.data.invoiceNumber}`, CORRELATION_ID],
    ['Batch', () => event.data.batch, () => `${event.data.frn}|${event.data.invoiceNumber}`, BATCH]
  ])('creates entity %s category', async (_, partitionKey, rowKey, category) => {
    if (typeof partitionKey === 'function') {
      event.data.batch = 'mock-batch'
      partitionKey = partitionKey()
      rowKey = rowKey()
    }
    await savePaymentEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(partitionKey, rowKey, category, event)
  })
})

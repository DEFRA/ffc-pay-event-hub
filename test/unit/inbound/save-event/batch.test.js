const { BATCH_EVENT } = require('../../../../app/constants/event-types')

jest.mock('../../../../app/storage')
const { getClient: mockGetClient } = require('../../../../app/storage')

const mockUpsertEntity = jest.fn()
const mockClient = {
  upsertEntity: mockUpsertEntity
}
mockGetClient.mockReturnValue(mockClient)

jest.mock('../../../../app/inbound/save-event/get-timestamp')
const { getTimestamp: mockGetTimestamp } = require('../../../../app/inbound/save-event/get-timestamp')

const mockTimestamp = 1234567890
mockGetTimestamp.mockReturnValue(mockTimestamp)

const { saveBatchEvent } = require('../../../../app/inbound/save-event/batch')

const event = require('../../../mocks/events/batch')

describe('save batch event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('uses batch client', async () => {
    await saveBatchEvent(event)
    expect(mockGetClient).toHaveBeenCalledWith(BATCH_EVENT)
  })

  test('creates one entity', async () => {
    await saveBatchEvent(event)
    expect(mockUpsertEntity).toHaveBeenCalledTimes(1)
  })

  test('creates entity with filename as partition key', async () => {
    await saveBatchEvent(event)
    expect(mockUpsertEntity).toHaveBeenCalledWith({
      partitionKey: event.data.filename,
      rowKey: mockTimestamp.toString(),
      category: BATCH_EVENT,
      ...event,
      data: JSON.stringify(event.data)
    }, 'Merge')
  })
})

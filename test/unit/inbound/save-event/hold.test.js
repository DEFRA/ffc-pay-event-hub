const { FRN, SCHEME_ID } = require('../../../../app/constants/categories')
const { HOLD_EVENT } = require('../../../../app/constants/event-types')

jest.mock('../../../../app/storage')
const { getClient: mockGetClient } = require('../../../../app/storage')

const mockUpsertEntity = jest.fn()
const mockClient = { upsertEntity: mockUpsertEntity }
mockGetClient.mockReturnValue(mockClient)

jest.mock('../../../../app/inbound/save-event/create-row')
const { createRow: mockCreateRow } = require('../../../../app/inbound/save-event/create-row')

const holdEntity = { partitionKey: 'mock-partition-key', rowKey: 'mock-row-key' }
mockCreateRow.mockReturnValue(holdEntity)

const { saveHoldEvent } = require('../../../../app/inbound/save-event/hold')
const event = require('../../../mocks/events/hold')

describe('save hold event', () => {
  beforeEach(() => jest.clearAllMocks())

  test('uses hold client', async () => {
    await saveHoldEvent(event)
    expect(mockGetClient).toHaveBeenCalledWith(HOLD_EVENT)
  })

  test('creates three entities', async () => {
    await saveHoldEvent(event)
    expect(mockUpsertEntity).toHaveBeenCalledTimes(3)
  })

  test.each([
    ['FRN entity', event.data.frn, event.data.schemeId, FRN],
    ['SchemeId entity', event.data.schemeId, event.data.frn, SCHEME_ID],
    ['HoldCategoryId entity', event.data.holdCategoryId, event.data.frn, SCHEME_ID]
  ])('creates %s', async (_, partitionKey, rowKey, category) => {
    await saveHoldEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith(partitionKey, rowKey, category, event)
  })
})

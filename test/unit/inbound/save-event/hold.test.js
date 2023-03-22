const { FRN, SCHEME_ID } = require('../../../../app/constants/categories')
const { HOLD_EVENT } = require('../../../../app/constants/event-types')

jest.mock('../../../../app/storage')
const { getClient: mockGetClient } = require('../../../../app/storage')

const mockCreateEntity = jest.fn()
const mockClient = {
  createEntity: mockCreateEntity
}
mockGetClient.mockReturnValue(mockClient)

jest.mock('../../../../app/inbound/save-event/create-entity')
const { createEntity: mockCreateHoldEntity } = require('../../../../app/inbound/save-event/create-entity')

const holdEntity = {
  partitionKey: 'mock-partition-key',
  rowKey: 'mock-row-key'
}
mockCreateHoldEntity.mockReturnValue(holdEntity)

const { saveHoldEvent } = require('../../../../app/inbound/save-event/hold')

const event = require('../../../mocks/hold-event')

describe('save hold event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('uses hold client', async () => {
    await saveHoldEvent(event)
    expect(mockGetClient).toHaveBeenCalledWith(HOLD_EVENT)
  })

  test('creates two entities', async () => {
    await saveHoldEvent(event)
    expect(mockCreateEntity).toHaveBeenCalledTimes(2)
  })

  test('creates entity frn category', async () => {
    await saveHoldEvent(event)
    expect(mockCreateHoldEntity).toHaveBeenCalledWith(event.data.frn, event.data.schemeId, FRN, event)
  })

  test('creates entity scheme id category', async () => {
    await saveHoldEvent(event)
    expect(mockCreateHoldEntity).toHaveBeenCalledWith(event.data.schemeId, event.data.frn, SCHEME_ID, event)
  })
})

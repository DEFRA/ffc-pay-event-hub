const { WARNING } = require('../../../../app/constants/categories')
const { WARNING_EVENT } = require('../../../../app/constants/event-types')

jest.mock('../../../../app/storage')
const { getClient: mockGetClient } = require('../../../../app/storage')

const mockCreateEntity = jest.fn()
const mockClient = {
  createEntity: mockCreateEntity
}
mockGetClient.mockReturnValue(mockClient)

jest.mock('../../../../app/inbound/save-event/create-row')
const { createRow: mockCreateRow } = require('../../../../app/inbound/save-event/create-row')

jest.mock('../../../../app/inbound/save-event/get-warning-type')
const { getWarningType: mockGetWarningType } = require('../../../../app/inbound/save-event/get-warning-type')

mockGetWarningType.mockReturnValue('event')

const warningEntity = {
  partitionKey: 'mock-partition-key',
  rowKey: 'mock-row-key'
}
mockCreateRow.mockReturnValue(warningEntity)

const { saveWarningEvent } = require('../../../../app/inbound/save-event/warning')

const event = require('../../../mocks/events/warning')

describe('save warning event', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('uses hold client', async () => {
    await saveWarningEvent(event)
    expect(mockGetClient).toHaveBeenCalledWith(WARNING_EVENT)
  })

  test('creates one entity', async () => {
    await saveWarningEvent(event)
    expect(mockCreateEntity).toHaveBeenCalledTimes(1)
  })

  test('creates entity warning category', async () => {
    await saveWarningEvent(event)
    expect(mockCreateRow).toHaveBeenCalledWith('event', event.id, WARNING, event)
  })
})

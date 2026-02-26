jest.mock('../../../../app/storage', () => ({
  writeDataRequestFile: jest.fn(),
}))
jest.mock(
  '../../../../app/data-requests/utils/generate-unique-filename',
  () => ({
    generateUniqueFilename: jest.fn(),
  })
)

const { writeDataRequestFile } = require('../../../../app/storage')
const {
  generateUniqueFilename,
} = require('../../../../app/data-requests/utils/generate-unique-filename')
const {
  persistExportFile,
} = require('../../../../app/data-requests/utils/persist-export-file')

describe('persistExportFile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('generates filename and writes payload to blob storage', async () => {
    const fakeFilename = 'events-2026-02-25.json'
    const fakeUrl = 'http://blobstorage.com/events-2026-02-25.json'
    const fileIdentifier = 'events'
    const eventData = [{ id: 1 }, { id: 2 }]

    generateUniqueFilename.mockReturnValue(fakeFilename)
    writeDataRequestFile.mockResolvedValue(fakeUrl)

    const result = await persistExportFile(fileIdentifier, eventData)

    expect(generateUniqueFilename).toHaveBeenCalledWith(fileIdentifier)
    expect(writeDataRequestFile).toHaveBeenCalledWith(
      fakeFilename,
      JSON.stringify({ data: eventData })
    )
    expect(result).toBe(fakeUrl)
  })
})

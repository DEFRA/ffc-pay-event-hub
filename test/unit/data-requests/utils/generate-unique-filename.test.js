const { generateUniqueFilename } = require('../../../../app/data-requests/utils/generate-unique-filename')

describe('generateUniqueFilename', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2026-02-25T12:34:56.789Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('generates a filename with default prefix and extension', () => {
    const filename = generateUniqueFilename()
    expect(filename).toBe(
      'default-2026-02-25T12-34-56-789Z.json'
    )
  })

  test('uses a custom prefix', () => {
    const filename = generateUniqueFilename('report')
    expect(filename).toBe(
      'report-2026-02-25T12-34-56-789Z.json'
    )
  })

  test('uses a custom extension', () => {
    const filename = generateUniqueFilename('report', 'txt')
    expect(filename).toBe(
      'report-2026-02-25T12-34-56-789Z.txt'
    )
  })

  test('replaces all colons and periods with hyphens', () => {
    const filename = generateUniqueFilename('file', 'log')
    expect(filename).toBe(
      'file-2026-02-25T12-34-56-789Z.log'
    )
  })
})

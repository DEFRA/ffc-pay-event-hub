const { GET } = require('../../../../../app/constants/methods')
const { SUCCESS, INTERNAL_SERVER_ERROR } = require('../../../../../app/constants/http-status')
const { getSuppressedReportData } = require('../../../../../app/report-data/get-suppressed-report-data')

jest.mock('../../../../../app/report-data/get-suppressed-report-data')

let server

describe('suppressed-report-data route', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    const { createServer } = require('../../../../../app/server/create-server')
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('GET /suppressed-report-data returns 200 with report file path', async () => {
    const mockReportPath = '/tmp/suppressed-report.csv'
    getSuppressedReportData.mockResolvedValue(mockReportPath)

    const options = {
      method: GET,
      url: '/suppressed-report-data'
    }

    const result = await server.inject(options)

    expect(result.statusCode).toBe(SUCCESS)
    expect(result.result).toEqual({ file: mockReportPath })
    expect(getSuppressedReportData).toHaveBeenCalledTimes(1)
  })

  test('GET /suppressed-report-data returns 500 if getSuppressedReportData fails', async () => {
    getSuppressedReportData.mockRejectedValue(new Error('Report generation failed'))

    const options = {
      method: GET,
      url: '/suppressed-report-data'
    }

    const result = await server.inject(options)

    expect(result.statusCode).toBe(INTERNAL_SERVER_ERROR)
    expect(result.result.message).toBe('An internal server error occurred')
    expect(getSuppressedReportData).toHaveBeenCalledTimes(1)
  })
})

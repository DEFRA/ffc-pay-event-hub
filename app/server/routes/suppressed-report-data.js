const { GET } = require('../../constants/methods')
const { getSuppressedReportData } = require('../../report-data/get-suppressed-report-data')

module.exports = {
  method: GET,
  path: '/suppressed-report-data',
  options: {
    handler: async (_request, h) => {
      const reportLocation = await getSuppressedReportData()

      return h.response({ file: reportLocation })
    }
  }
}

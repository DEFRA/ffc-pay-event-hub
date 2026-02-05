const { GET } = require('../../constants/methods')
const { getSuppressedReportData } = require('../../report-data/get-suppressed-report-data')

module.exports = {
  method: GET,
  path: '/shared-report-data',
  options: {
    handler: async (request, h) => {
      const reportLocation = await getSuppressedReportData()

      return h.response({ file: reportLocation })
    }
  }
}

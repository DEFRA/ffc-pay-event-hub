const { GET } = require('../../constants/methods')
const { OK } = require('../../constants/http-status')

module.exports = {
  method: GET,
  path: '/healthz',
  handler: (_request, h) => {
    return h.response('ok').code(OK)
  }
}

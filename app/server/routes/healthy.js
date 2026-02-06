const { GET } = require('../../constants/methods')
const { SUCCESS } = require('../../constants/http-status')

module.exports = {
  method: GET,
  path: '/healthy',
  handler: (_request, h) => {
    return h.response('ok').code(SUCCESS)
  },
}

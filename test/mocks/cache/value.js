const { REQUEST } = require('../request')
const { RESPONSE } = require('../values/response')

const value = {
  request: REQUEST,
  response: RESPONSE
}

module.exports = {
  VALUE: value,
  VALUE_STRING: JSON.stringify(value)
}

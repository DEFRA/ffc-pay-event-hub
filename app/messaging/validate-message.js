const schema = require('./message-schema')
const { VALIDATION } = require('../constants/errors')

const validateMessage = (event) => {
  const validationResult = schema.validate(event, { abortEarly: false, allowUnknown: true })
  if (validationResult.error) {
    const error = new Error(`Request is invalid, ${validationResult.error.message}`)
    error.category = VALIDATION
    throw error
  }
}

module.exports = {
  validateMessage
}

const schema = require('./schema')
const { VALIDATION } = require('../constants/errors')

const validateRequest = (event) => {
  const validationResult = schema.validate(event, { abortEarly: false, allowUnknown: true })
  if (validationResult.error) {
    const error = new Error(`Event is invalid, ${validationResult.error.message}`)
    error.category = VALIDATION
    throw error
  }
}

module.exports = validateRequest

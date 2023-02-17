const Joi = require('joi')

module.exports = Joi.object({
  filename: Joi.string().required()
})

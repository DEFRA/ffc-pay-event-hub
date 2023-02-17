const Joi = require('joi')

module.exports = Joi.object({
  schemeId: Joi.number().integer().required()
})

const Joi = require('joi')

module.exports = Joi.object({
  frn: Joi.number().integer().required(),
  correlationId: Joi.string().guid().required(),
  schemeId: Joi.number().integer().required()
})

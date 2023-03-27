const Joi = require('joi')

module.exports = Joi.object({
  frn: Joi.number().integer().positive().required(),
  correlationId: Joi.string().guid().required(),
  schemeId: Joi.number().integer().positive().required(),
  invoiceNumber: Joi.string().required()
})

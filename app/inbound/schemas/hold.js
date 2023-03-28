const Joi = require('joi')

module.exports = Joi.object({
  schemeId: Joi.number().integer().positive().required(),
  frn: Joi.number().integer().positive().required(),
  holdCategoryId: Joi.number().integer().positive().required()
})

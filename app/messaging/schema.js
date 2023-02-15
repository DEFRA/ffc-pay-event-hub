const Joi = require('joi')

module.exports = Joi.object({
  specversion: Joi.string().required(),
  type: Joi.string().required(),
  source: Joi.string().required(),
  subject: Joi.string().required(),
  id: Joi.string().required(),
  time: Joi.date().required(),
  datacontenttype: Joi.string().optional(),
  data: Joi.any().optional()
}).required()

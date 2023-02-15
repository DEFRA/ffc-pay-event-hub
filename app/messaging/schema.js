const Joi = require('joi')

module.exports = Joi.object({
  specversion: Joi.string().required(),
  type: Joi.string().required(),
  source: Joi.string().required(),
  id: Joi.string().uuid().required(),
  time: Joi.date().required(),
  subject: Joi.string().optional(),
  datacontenttype: Joi.string().optional(),
  data: Joi.any().optional()
}).required()

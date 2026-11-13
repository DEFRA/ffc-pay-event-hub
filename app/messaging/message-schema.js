const Joi = require('joi')
const { FRN, CORRELATION_ID, BATCH, SCHEME_ID, DATE } = require('../constants/categories')

module.exports = Joi.object({
  body: Joi.object({
    category: Joi.string().allow(FRN, CORRELATION_ID, BATCH, SCHEME_ID, DATE).required(),
    value: Joi.when('category', {
      is: DATE,
      then: Joi.object({
        schemeId: Joi.number().integer().required(),
        day: Joi.number().integer().required(),
        month: Joi.number().integer().required(),
        year: Joi.number().integer().required()
      }).required(),
      otherwise: Joi.when('category', {
        is: SCHEME_ID,
        then: Joi.number().integer().required().messages({
          'number.base': `value must be an integer when category is ${SCHEME_ID}`
        }),
        otherwise: Joi.string().required()
      })
    })
  }).required()
}).required()

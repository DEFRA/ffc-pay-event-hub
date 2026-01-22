const Joi = require('joi')
const { FRN, CORRELATION_ID, BATCH, SCHEME_ID } = require('../constants/categories')

module.exports = Joi.object({
  body: Joi.object({
    category: Joi.string().allow(FRN, CORRELATION_ID, BATCH, SCHEME_ID).required(),
    value: Joi.alternatives()
      .conditional('category', {
        is: SCHEME_ID,
        then: Joi.number().integer().required().messages({
          'number.base': `value must be an integer when category is ${SCHEME_ID}`
        }),
        otherwise: Joi.string().required()
      })
  }).required()
}).required()

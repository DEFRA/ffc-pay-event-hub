const Joi = require('joi')

module.exports = Joi.object({
  frn: Joi.number().integer().positive().optional(),
  sbi: Joi.number().integer().positive().optional().allow('', null),
  trader: Joi.string().optional().allow('', null),
  vendor: Joi.string().optional().allow('', null),
  correlationId: Joi.string().guid().required(),
  schemeId: Joi.number().integer().positive().required(),
  invoiceNumber: Joi.string().required()
}).custom((value, helpers) => {
  const { frn, sbi, trader, vendor } = value

  if (!frn && !sbi && !trader && !vendor) {
    return helpers.error('any.custom', { message: 'No customer identifier has been provided' })
  }

  return value
})

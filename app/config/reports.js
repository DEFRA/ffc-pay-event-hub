const Joi = require('joi')

const schema = Joi.object({
  miReportName: Joi.string().default('ffc-pay-mi-report-v2.csv')
})

const config = {
  miReportName: process.env.MI_REPORT_NAME
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The report config is invalid. ${result.error.message}`)
}

module.exports = result.value

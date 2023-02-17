const Joi = require('joi')

const schema = Joi.object({
  useConnectionString: Joi.bool().default(false),
  connectionString: Joi.string().optional(),
  account: Joi.string().required(),
  paymentTable: Joi.string().default('payments'),
  holdTable: Joi.string().default('holds'),
  warningTable: Joi.string().default('warnings'),
  batchTable: Joi.string().default('batches')
})

const config = {
  useConnectionString: process.env.AZURE_STORAGE_USE_CONNECTION_STRING,
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  account: process.env.AZURE_STORAGE_ACCOUNT,
  paymentTable: process.env.AZURE_STORAGE_PAYMENT_REQUEST_TABLE,
  holdTable: process.env.AZURE_STORAGE_HOLD_TABLE,
  warningTable: process.env.AZURE_STORAGE_WARNING_TABLE,
  batchTable: process.env.AZURE_STORAGE_BATCH_TABLE
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The message config is invalid. ${result.error.message}`)
}

module.exports = result.value

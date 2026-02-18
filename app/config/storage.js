const Joi = require('joi')

const schema = Joi.object({
  useConnectionString: Joi.bool().default(false),
  connectionString: Joi.string().optional(),
  account: Joi.string().required(),
  container: Joi.string().default('reports'),
  dataRequestContainer: Joi.string().default('data-requests'),
  createEntities: Joi.bool().default(false),
  managedIdentityClientId: Joi.string().optional()
})

const config = {
  useConnectionString: process.env.AZURE_STORAGE_USE_CONNECTION_STRING,
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  account: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  container: process.env.AZURE_STORAGE_CONTAINER,
  dataRequestContainer: process.env.AZURE_STORAGE_DATA_REQUEST_CONTAINER,
  createEntities: process.env.AZURE_STORAGE_CREATE_ENTITIES,
  managedIdentityClientId: process.env.AZURE_CLIENT_ID
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The storage config is invalid. ${result.error.message}`)
}

module.exports = result.value

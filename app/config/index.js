const storageConfig = require('./storage')
const cacheConfig = require('./cache')
const messageConfig = require('./message')
const databaseConfig = require('./database')

const Joi = require('joi')
const { DEVELOPMENT, TEST, PRODUCTION } = require('../constants/environments')

const schema = Joi.object({
  processingActive: Joi.boolean().default(true),
  env: Joi.string().valid(DEVELOPMENT, TEST, PRODUCTION).default(DEVELOPMENT),
  processingInterval: Joi.number().default(10000)
})

const config = {
  processingActive: process.env.PROCESSING_ACTIVE,
  env: process.env.NODE_ENV,
  processingInterval: process.env.PROCESSING_INTERVAL
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The config is invalid. ${result.error.message}`)
}

const value = result.value

value.isDev = value.env === DEVELOPMENT
value.isTest = value.env === TEST
value.isProd = value.env === PRODUCTION
value.paymentTopic = messageConfig.paymentTopic
value.eventsTopic = messageConfig.eventsTopic
value.storageConfig = storageConfig
value.dbConfig = databaseConfig
value.storageConfig = storageConfig
value.cacheConfig = cacheConfig
value.messageConfig = messageConfig

module.exports = value

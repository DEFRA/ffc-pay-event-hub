const Joi = require('joi')

const schema = Joi.object({
  socket: Joi.object({
    host: Joi.string(),
    port: Joi.number().default(6379),
    tls: Joi.boolean().default(false)
  }),
  password: Joi.string().allow(''),
  partition: Joi.string().default('ffc-pay-data-hub'),
  ttl: Joi.number().default(30),
  cache: Joi.string().default('payments')
})

const config = {
  socket: {
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    tls: process.env.NODE_ENV === 'production'
  },
  password: process.env.REDIS_PASSWORD,
  partition: process.env.REDIS_PARTITION,
  ttl: process.env.REDIS_TTL,
  cache: process.env.REDIS_DATA_CACHE
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The cache config is invalid. ${result.error.message}`)
}

module.exports = result.value

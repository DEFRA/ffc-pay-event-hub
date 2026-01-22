const Joi = require('joi')

const schema = Joi.object({
  socket: Joi.object({
    host: Joi.string(),
    port: Joi.number().default(6379),
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    tls: Joi.boolean().default(false)
  }),
  password: Joi.string().allow(''),
  partition: Joi.string().default('ffc-pay-data-hub'),
  ttl: Joi.number().default(30),
  cache: Joi.string().default('payments')
=======
=======
>>>>>>> Stashed changes
    tls: Joi.boolean().default(false),
  }),
  password: Joi.string().allow(''),
  partition: Joi.string().default('ffc-pay-event-hub'),
  ttl: Joi.number().default(30),
  cache: Joi.string().default('payments'),
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
})

const config = {
  socket: {
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    tls: process.env.NODE_ENV === 'production'
=======
    tls: process.env.NODE_ENV === 'production',
>>>>>>> Stashed changes
=======
    tls: process.env.NODE_ENV === 'production',
>>>>>>> Stashed changes
  },
  password: process.env.REDIS_PASSWORD,
  partition: process.env.REDIS_PARTITION,
  ttl: process.env.REDIS_TTL,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  cache: process.env.REDIS_DATA_CACHE
}

const result = schema.validate(config, {
  abortEarly: false
=======
=======
>>>>>>> Stashed changes
  cache: process.env.REDIS_DATA_CACHE,
}

const result = schema.validate(config, {
  abortEarly: false,
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
})

if (result.error) {
  throw new Error(`The cache config is invalid. ${result.error.message}`)
}

module.exports = result.value

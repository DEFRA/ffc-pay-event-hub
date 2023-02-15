const Joi = require('joi')

const schema = Joi.object({
  messageQueue: {
    host: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool().default(false),
    appInsights: Joi.object()
  },
  eventSubscription: {
    address: Joi.string(),
    topic: Joi.string(),
    type: Joi.string().default('subscription')
  }
})

const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    useCredentialChain: process.env.NODE_ENV === 'production',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined
  },
  eventSubscription: {
    address: process.env.EVENT_SUBSCRIPTION_ADDRESS,
    topic: process.env.EVENT_TOPIC_ADDRESS,
    type: 'subscription'
  }
}

const mqResult = schema.validate(mqConfig, {
  abortEarly: false
})

if (mqResult.error) {
  throw new Error(`The message config is invalid. ${mqResult.error.message}`)
}

const eventSubscription = { ...mqResult.value.messageQueue, ...mqResult.value.eventSubscription }

module.exports = {
  eventSubscription
}

const Joi = require('joi')
const { PRODUCTION } = require('../constants/environments')

const schema = Joi.object({
  messageQueue: {
    host: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool().default(false),
    appInsights: Joi.object(),
    managedIdentityClientId: Joi.string().optional()
  },
  eventsSubscription: {
    address: Joi.string(),
    topic: Joi.string(),
    type: Joi.string().default('subscription'),
    maxConcurrentCalls: Joi.number().integer().min(1).default(10)
  },
  alertTopic: {
    address: Joi.string()
  }
})

const config = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    useCredentialChain: process.env.NODE_ENV === PRODUCTION,
    appInsights: process.env.NODE_ENV === PRODUCTION ? require('applicationinsights') : undefined,
    managedIdentityClientId: process.env.AZURE_CLIENT_ID
  },
  eventsSubscription: {
    address: process.env.EVENTS_SUBSCRIPTION_ADDRESS,
    topic: process.env.EVENTS_TOPIC_ADDRESS,
    type: 'subscription',
    maxConcurrentCalls: parseInt(process.env.MAX_CONCURRENT_CALLS, 10) || 10
  },
  alertTopic: {
    address: process.env.ALERT_TOPIC_ADDRESS
  }
}

const result = schema.validate(config, {
  abortEarly: false
})

if (result.error) {
  throw new Error(`The message config is invalid. ${result.error.message}`)
}

const eventsSubscription = { ...result.value.messageQueue, ...result.value.eventsSubscription }
const alertTopic = { ...result.value.messageQueue, ...result.value.alertTopic }

module.exports = {
  eventsSubscription,
  alertTopic
}

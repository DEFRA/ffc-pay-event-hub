const { messageConfig } = require('../config')
const { processEventMessage } = require('./process-event-message')
const { processDataMessage } = require('./process-data-message')

const { MessageReceiver } = require('ffc-messaging')

let eventsReceiver
let dataReceiver

const start = async () => {
  const action = message => processEventMessage(message, eventsReceiver)
  eventsReceiver = new MessageReceiver(messageConfig.eventsSubscription, action)
  await eventsReceiver.subscribe()

  const calculateAction = message => processDataMessage(message, dataReceiver)
  dataReceiver = new MessageReceiver(messageConfig.dataSubscription, calculateAction)
  await dataReceiver.subscribe()

  console.info('Ready to receive messages')
}

const stop = async () => {
  await eventsReceiver.closeConnection()
  await dataReceiver.closeConnection()
}

module.exports = { start, stop }

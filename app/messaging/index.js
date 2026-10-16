const { messageConfig } = require('../config')
const { createServiceBusClient, createReceiver, subscribeReceiver, closeSenders } = require('./service-bus')
const { processEventMessage } = require('./process-event-message')
const { processDataMessage } = require('./process-data-message')
const { processRetentionMessage } = require('./process-retention-message')
const { createDiagnosticsHandler } = require('./diagnostics')

let eventsReceiver
let dataReceiver
let retentionReceiver
let sbClient

const start = async () => {
  sbClient = createServiceBusClient(messageConfig.eventsSubscription)
  const action = message => processEventMessage(message, eventsReceiver)
  eventsReceiver = createReceiver(sbClient, messageConfig.eventsSubscription)
  subscribeReceiver(eventsReceiver, action, createDiagnosticsHandler('events-receiver'), messageConfig.eventsSubscription)

  const calculateAction = message => processDataMessage(message, dataReceiver)
  dataReceiver = createReceiver(sbClient, messageConfig.dataSubscription)
  subscribeReceiver(dataReceiver, calculateAction, createDiagnosticsHandler('data-receiver'), messageConfig.dataSubscription)

  const retentionAction = message => processRetentionMessage(message, retentionReceiver)
  retentionReceiver = createReceiver(sbClient, messageConfig.retentionSubscription)
  subscribeReceiver(retentionReceiver, retentionAction, createDiagnosticsHandler('retention-receiver'), messageConfig.retentionSubscription)

  console.info('Ready to receive messages')
}

const stop = async () => {
  try {
    await closeSenders()
  } catch (error) {
    console.error('Error stopping receiver')
  }
  if (eventsReceiver) {
    await eventsReceiver.closeConnection()
  }
  if (dataReceiver) {
    await dataReceiver.closeConnection()
  }
  if (retentionReceiver) {
    await retentionReceiver.closeConnection()
  }
}

module.exports = { start, stop }

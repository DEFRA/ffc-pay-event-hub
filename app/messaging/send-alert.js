const { messageConfig } = require('../config')
const { createMessage } = require('./create-message')
const { getSender, sendMessage: sendServiceBusMessage } = require('./service-bus')

const sendAlert = async (body) => {
  const message = createMessage(body)
  const sender = getSender(messageConfig.alertTopic)
  await sendServiceBusMessage(sender, message)
  console.log('Request for alert sent')
}

module.exports = {
  sendAlert
}

const { createMessage } = require('./create-message')
const { getSender, sendMessage: sendServiceBusMessage } = require('./service-bus')

const sendMessage = async (body, type, config, options) => {
  const message = createMessage(body, type, options)
  const sender = getSender(config)
  await sendServiceBusMessage(sender, message)
}

module.exports = {
  sendMessage
}

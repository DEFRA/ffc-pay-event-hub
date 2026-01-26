const { PARTITION } = require('./partition')
const { NAME } = require('./name')

module.exports = {
  PREFIX: `${PARTITION}:${NAME}`
}

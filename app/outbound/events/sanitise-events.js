const moment = require('moment-timezone')
const schemeNames = require('../../constants/scheme-names')
const eventDetails = require('../../constants/event-details')
const { TIMEZONE } = require('../../constants/timezone')
const { DATE } = require('../../constants/date-format')
const { PAYMENT_EXTRACTED } = require('../../constants/events')
const { convertToPence } = require('../../currency')

const sanitiseEvents = (events) => {
  console.log('Hi Dude', events[0])
  return events.map(group => ({
    ...group,
    scheme: schemeNames[group.schemeId],
    status: eventDetails[group.events[group.events.length - 1].type],
    lastUpdated: moment(group.events[group.events.length - 1].time).tz(TIMEZONE).format(DATE),
    events: group.events.map(event => ({
      ...event,
      data: {
        ...event.data,
        value: event.type === PAYMENT_EXTRACTED ? convertToPence(event.data.value) : event.data.value
      },
      status: eventDetails[event.type],
      timestamp: moment(event.time).tz(TIMEZONE).format(DATE)
    }))
  }))
}

module.exports = {
  sanitiseEvents
}

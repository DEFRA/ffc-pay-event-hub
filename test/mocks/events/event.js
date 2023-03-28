const { DATA } = require('../values/data')
const { DATA_CONTENT_TYPE } = require('../values/data-content-type')
const { ID } = require('../values/id')
const { SOURCE } = require('../values/source')
const { SPEC_VERSION } = require('../values/spec-version')
const { SUBJECT } = require('../values/subject')
const { TIME } = require('../values/time')
const { TYPE } = require('../values/type')

module.exports = {
  specversion: SPEC_VERSION,
  type: TYPE,
  source: SOURCE,
  id: ID,
  time: TIME,
  subject: SUBJECT,
  datacontenttype: DATA_CONTENT_TYPE,
  data: DATA
}

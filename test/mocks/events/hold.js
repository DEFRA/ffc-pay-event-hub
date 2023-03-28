const event = require('./event')
const { HOLD_TYPE } = require('../values/type')
const { FRN } = require('../values/frn')
const { SCHEME_ID } = require('../values/scheme-id')
const { HOLD_CATEGORY_ID } = require('../values/hold-category-id')

module.exports = {
  ...event,
  type: HOLD_TYPE,
  data: {
    frn: FRN,
    schemeId: SCHEME_ID,
    holdCategoryId: HOLD_CATEGORY_ID
  }
}

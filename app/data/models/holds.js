const defineCommonModel = require('./commonModel')

const defineHoldsModel = (sequelize, DataTypes) =>
  defineCommonModel(
    sequelize,
    DataTypes,
    'holds'
  )

module.exports = defineHoldsModel

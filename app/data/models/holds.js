const defineCommonModel = require('./commonModel')

const defineHoldsModel = (sequelize, DataTypes) =>
  defineCommonModel(
    sequelize,
    DataTypes,
    'holds',
    {
      subject: DataTypes.TEXT
    }
  )

module.exports = defineHoldsModel

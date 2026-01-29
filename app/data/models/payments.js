const defineCommonModel = require('./commonModel')

const definePaymentsModel = (sequelize, DataTypes) =>
  defineCommonModel(
    sequelize,
    DataTypes,
    'payments',
    {
      subject: DataTypes.TEXT
    }
  )

module.exports = definePaymentsModel

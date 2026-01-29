const defineCommonModel = require('./commonModel')
module.exports = (sequelize, DataTypes) =>
  defineCommonModel(sequelize,
    DataTypes,
    'payments', {
      subject: DataTypes.TEXT
    })

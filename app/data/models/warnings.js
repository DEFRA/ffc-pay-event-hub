const defineCommonModel = require('./commonModel')
module.exports = (sequelize, DataTypes) =>
  defineCommonModel(sequelize,
    DataTypes,
    'warnings', {
      subject: DataTypes.TEXT
    })

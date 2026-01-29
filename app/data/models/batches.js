const defineCommonModel = require('./commonModel')
module.exports = (sequelize, DataTypes) =>
  defineCommonModel(sequelize,
    DataTypes,
    'batches', {
      subject: DataTypes.TEXT
    })

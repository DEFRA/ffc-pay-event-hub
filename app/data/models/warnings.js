const defineCommonModel = require('./commonModel')

const defineWarningsModel = (sequelize, DataTypes) =>
  defineCommonModel(
    sequelize,
    DataTypes,
    'warnings',
    {
      subject: DataTypes.TEXT
    }
  )

module.exports = defineWarningsModel

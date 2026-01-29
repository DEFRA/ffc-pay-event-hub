const defineCommonModel = require('./commonModel')

const defineBatchesModel = (sequelize, DataTypes) =>
  defineCommonModel(
    sequelize,
    DataTypes,
    'batches',
    {
      subject: DataTypes.TEXT
    }
  )

module.exports = defineBatchesModel

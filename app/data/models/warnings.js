const defineCommonModel = require('./common-model')

const defineWarningsModel = (sequelize, DataTypes) =>
  defineCommonModel(sequelize, DataTypes, 'warnings', {
    subject: DataTypes.TEXT,
  })

module.exports = defineWarningsModel

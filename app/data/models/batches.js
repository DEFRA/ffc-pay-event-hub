const defineCommonModel = require("./common-model");

const defineBatchesModel = (sequelize, DataTypes) =>
  defineCommonModel(sequelize, DataTypes, "batches", {
    subject: DataTypes.TEXT,
  });

module.exports = defineBatchesModel;

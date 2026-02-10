const defineCommonModel = require("./common-model");

const defineHoldsModel = (sequelize, DataTypes) =>
  defineCommonModel(sequelize, DataTypes, "holds");

module.exports = defineHoldsModel;

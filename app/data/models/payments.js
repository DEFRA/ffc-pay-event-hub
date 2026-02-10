const defineCommonModel = require("./common-model");

const definePaymentsModel = (sequelize, DataTypes) =>
  defineCommonModel(sequelize, DataTypes, "payments", {
    subject: DataTypes.TEXT,
  });

module.exports = definePaymentsModel;

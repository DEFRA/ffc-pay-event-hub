const defineCommonModel = (
  sequelize,
  DataTypes,
  tableName,
  extraFields = {}
) => {
  const baseFields = {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    partitionKey: DataTypes.TEXT,
    rowKey: DataTypes.TEXT,
    timestamp: DataTypes.DATE,
    type: DataTypes.TEXT,
    source: DataTypes.TEXT,
    time: DataTypes.DATE,
    category: DataTypes.TEXT,
    data: DataTypes.JSONB
  }

  const fields = { ...baseFields, ...extraFields }

  return sequelize.define(tableName, fields, {
    tableName,
    freezeTableName: true,
    timestamps: false
  })
}

module.exports = defineCommonModel

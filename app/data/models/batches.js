module.exports = (sequelize, DataTypes) => {
  return sequelize.define('batch', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    PartitionKey: DataTypes.TEXT,
    RowKey: DataTypes.TEXT,
    TimeStamp: DataTypes.DATE,
    type: DataTypes.TEXT,
    source: DataTypes.TEXT,
    subject: DataTypes.TEXT,
    time: DataTypes.DATE,
    category: DataTypes.TEXT,
    data: DataTypes.JSONB
  },
  {
    tableName: 'batches',
    freezeTableName: true,
    timestamps: false
  })
}

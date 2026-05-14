const definePaymentBatchEvents = (sequelize, DataTypes) => {
  const paymentBatchEvents = sequelize.define(
    'paymentBatchEvents',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      batchName: DataTypes.STRING,
      schemeId: DataTypes.INTEGER,
      frn: DataTypes.STRING,
      marketingYear: DataTypes.INTEGER,
      agreementNumber: DataTypes.STRING,
      paymentRequestNumber: DataTypes.INTEGER,
      originalValue: DataTypes.NUMERIC,
      type: DataTypes.STRING,
      providesAccountingValues: DataTypes.BOOLEAN
    },
    {
      tableName: 'payment_batch_events',
      timestamps: false
    }
  )

  return paymentBatchEvents
}

module.exports = definePaymentBatchEvents

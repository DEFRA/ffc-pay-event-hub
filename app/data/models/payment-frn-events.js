const definePaymentFrnEvents = (sequelize, DataTypes) => {
  const paymentFrnEvents = sequelize.define(
    'paymentFrnEvents',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      frn: DataTypes.STRING,
      correlationId: DataTypes.STRING,
      schemeId: DataTypes.INTEGER,
      agreementNumber: DataTypes.STRING,
      paymentRequestNumber: DataTypes.INTEGER,
      originalValue: DataTypes.NUMERIC,
      type: DataTypes.STRING,
      lastUpdated: DataTypes.DATE
    },
    {
      tableName: 'payment_frn_events',
      timestamps: false,
    }
  )

  return paymentFrnEvents
}

module.exports = definePaymentFrnEvents

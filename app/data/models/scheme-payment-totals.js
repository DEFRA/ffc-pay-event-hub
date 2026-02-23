const defineSchemePaymentTotals = (sequelize, DataTypes) => {
  const schemePaymentTotals = sequelize.define(
    'schemePaymentTotals',
    {
      schemeId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      paymentRequests: {
        type: DataTypes.BIGINT,
      },
      total_value: {
        type: DataTypes.NUMERIC,
      },
      value: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'v_scheme_payment_totals',
      timestamps: false,
    }
  )

  return schemePaymentTotals
}

module.exports = defineSchemePaymentTotals

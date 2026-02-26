const defineSchemePaymentTotals = (sequelize, DataTypes) => {
  const schemePaymentTotals = sequelize.define(
    'schemePaymentTotals',
    {
      schemeId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      paymentRequests: DataTypes.BIGINT,
      value: DataTypes.STRING,
    },
    {
      tableName: 'v_submitted_payment_totals_by_scheme',
      timestamps: false,
    }
  )

  return schemePaymentTotals
}

module.exports = defineSchemePaymentTotals

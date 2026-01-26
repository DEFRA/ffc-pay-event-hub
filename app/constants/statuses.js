module.exports = {
  PAYMENT_EXTRACTED_STATUS: 'Batch received',
  PAYMENT_ENRICHED_STATUS: 'Request enriched with mandatory data',
  PAYMENT_PAUSED_CROSS_BORDER_STATUS: 'Waiting for Cross Border calculation',
  PAYMENT_PAUSED_DEBT_STATUS: 'Waiting for debt data',
  PAYMENT_DEBT_ATTACHED_STATUS: 'Debt data attached',
  PAYMENT_PAUSED_LEDGER_STATUS: 'Waiting for ledger assignment',
  PAYMENT_LEDGER_ASSIGNED_STATUS: 'Ledger assigned',
  PAYMENT_PAUSED_QUALITY_CHECK_STATUS: 'Waiting for ledger assignment quality check',
  PAYMENT_QUALITY_CHECK_FAILED_STATUS: 'Ledger assignment quality check failed, waiting for correction',
  PAYMENT_QUALITY_CHECK_PASSED_STATUS: 'Ledger assignment quality check passed',
  PAYMENT_RESET_STATUS: 'Reset to be recalculated',
  PAYMENT_PROCESSED_NO_FURTHER_ACTION_STATUS: 'Payment processed with no identified updates to send to D365',
  PAYMENT_PROCESSED_STATUS: 'Calculation of final state completed',
  PAYMENT_SUBMITTED_STATUS: 'Submitted to payment ledger',
  PAYMENT_ACKNOWLEDGED_STATUS: 'Acknowledged by payment ledger',
  PAYMENT_SETTLED_STATUS: 'Settled by payment ledger',
  PAYMENT_SUPPRESSED_STATUS: 'Accounts Receivable value suppressed due to closure'
}

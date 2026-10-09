const eventColumns = [
  'id',
  'partitionKey',
  'rowKey',
  'timestamp',
  'type',
  'source',
  'time',
  'category',
  'data'
]

module.exports = {
  batches: [...eventColumns, 'subject'],
  holds: eventColumns,
  paymentBatchEvents: [
    'id',
    'batchName',
    'schemeId',
    'frn',
    'marketingYear',
    'agreementNumber',
    'paymentRequestNumber',
    'originalValue',
    'type',
    'providesAccountingValues'
  ],
  paymentFrnEvents: [
    'id',
    'frn',
    'correlationId',
    'schemeId',
    'agreementNumber',
    'paymentRequestNumber',
    'originalValue',
    'type',
    'lastUpdated',
    'providesAccountingValues'
  ],
  payments: [...eventColumns, 'subject'],
  schemePaymentTotals: ['schemeId', 'paymentRequests', 'value'],
  warnings: [...eventColumns, 'subject']
}

const TABLES = require('./tables')

const COLUMNS = {
  [TABLES.batches]: [
    'id',
    'partitionKey',
    'rowKey',
    'timestamp',
    'type',
    'source',
    'subject',
    'time',
    'category',
    'data'
  ],
  [TABLES.holds]: [
    'id',
    'partitionKey',
    'rowKey',
    'timestamp',
    'type',
    'source',
    'time',
    'category',
    'data'
  ],
  [TABLES.paymentBatchEvents]: [
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
  [TABLES.paymentFrnEvents]: [
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
  [TABLES.payments]: [
    'id',
    'partitionKey',
    'rowKey',
    'timestamp',
    'type',
    'source',
    'subject',
    'time',
    'category',
    'data'
  ],
  [TABLES.schemePaymentTotals]: [
    'schemeId',
    'paymentRequests',
    'totalValue',
    'value'
  ],
  [TABLES.warnings]: [
    'id',
    'partitionKey',
    'rowKey',
    'timestamp',
    'type',
    'source',
    'subject',
    'time',
    'category',
    'data'
  ]
}

const pickColumns = (record, table) => {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([column]) => COLUMNS[table].includes(column))
  )
}

module.exports = {
  COLUMNS,
  pickColumns
}

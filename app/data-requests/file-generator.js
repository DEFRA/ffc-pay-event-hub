const { PassThrough } = require('node:stream')
const QueryStream = require('pg-query-stream')

const db = require('../database')
const TABLE_COLUMNS = require('../constants/table-columns')
const { streamDataRequestFile } = require('../storage')
const { generateUniqueFilename } = require('./utils/generate-unique-filename')

const defaultStreamOptions = {
  onStart: (stream) => stream.write('[\n'),
  onEnd: (stream) => stream.end('\n]\n')
}

const streamRowsAsJsonArray = (
  pgStream,
  outputStream,
  rowProcessor,
  options = defaultStreamOptions
) =>
  new Promise((resolve, reject) => {
    const { onStart, onEnd } = options
    const firstRowFlag = { value: true }

    if (onStart) {
      onStart(outputStream)
    }

    pgStream.on('data', (row) => rowProcessor(row, outputStream, firstRowFlag))

    pgStream.on('end', () => {
      if (onEnd) {
        onEnd(outputStream)
      } else {
        outputStream.end()
      }
      resolve()
    })

    pgStream.on('error', reject)
  })

const createStreamingQuery = (sql, client, batchSize = 5000) => {
  return client.query(new QueryStream(sql, [], { batchSize }))
}

const getDbClient = async () => {
  return db.client.client.acquireConnection()
}

const releaseDbClient = async (client) => {
  return db.client.client.releaseConnection(client)
}

const exportQueryToJsonFile = async (
  sql,
  rowProcessor,
  fileIdentifier = undefined,
  streamOptions = defaultStreamOptions,
  batchSize = 5000
) => {
  const client = await getDbClient()
  const passThrough = new PassThrough()

  try {
    const filename = generateUniqueFilename(fileIdentifier)
    const pgStream = createStreamingQuery(sql, client, batchSize)

    const savePromise = streamDataRequestFile(filename, passThrough)
    await streamRowsAsJsonArray(
      pgStream,
      passThrough,
      rowProcessor,
      streamOptions
    )
    await savePromise

    return filename
  } catch (err) {
    console.error('Failed to export report:', err)
    throw err
  } finally {
    await releaseDbClient(client)
  }
}

const generateSqlQuery = (whereClause, tableName, orderBy = null) => {
  if (!Object.hasOwn(TABLE_COLUMNS, tableName)) {
    throw new Error(`Table model '${tableName}' not found in database`)
  }

  const validColumns = TABLE_COLUMNS[tableName]
  const query = db[tableName]()

  if (whereClause) {
    query.where(whereClause)
  }

  if (orderBy) {
    if (!Array.isArray(orderBy)) {
      throw new TypeError('orderBy must be an array')
    }

    orderBy.forEach(([column, direction]) => {
      if (!validColumns.includes(column)) {
        throw new Error(`Invalid order column: ${column}`)
      }

      const dir = String(direction).toUpperCase()
      if (!['ASC', 'DESC'].includes(dir)) {
        throw new Error(`Invalid order direction: ${direction}`)
      }

      query.orderBy(column, dir.toLowerCase())
    })
  }

  return query.toQuery()
}

module.exports = { generateSqlQuery, exportQueryToJsonFile }

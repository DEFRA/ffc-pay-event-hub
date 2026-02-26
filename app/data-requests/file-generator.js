const { PassThrough } = require('node:stream')
const QueryStream = require('pg-query-stream')

const db = require('../data')
const { streamDataRequestFile } = require('../storage')
const { generateUniqueFilename } = require('./utils/generate-unique-filename')

const defaultStreamOptions = {
  onStart: (stream) => stream.write('[\n'),
  onEnd: (stream) => stream.end('\n]\n'),
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

const createStreamingQuery = (sql, client, batchSize = 5000) =>
  client.query(new QueryStream(sql, [], { batchSize }))

const getDbClient = async () => {
  return db.sequelize.connectionManager.getConnection()
}

const releaseDbClient = async (client) => {
  return db.sequelize.connectionManager.releaseConnection(client)
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
  const model = db[tableName]

  if (!model) {
    throw new Error(`Table model '${tableName}' not found in database`)
  }

  const actualTableName = model.getTableName()
  const baseQuery = `SELECT * FROM ${actualTableName}`

  const queryGenerator = db.sequelize.getQueryInterface().queryGenerator

  let query = baseQuery

  if (whereClause) {
    const whereSql = queryGenerator.getWhereConditions(
      whereClause,
      actualTableName
    )
    query += ` WHERE ${whereSql}`
  }

  if (orderBy) {
    if (!Array.isArray(orderBy)) {
      throw new TypeError('orderBy must be an array')
    }

    const validColumns = Object.keys(model.rawAttributes)

    const orderParts = orderBy.map(([column, direction]) => {
      if (!validColumns.includes(column)) {
        throw new Error(`Invalid order column: ${column}`)
      }

      const dir = String(direction).toUpperCase()
      if (!['ASC', 'DESC'].includes(dir)) {
        throw new Error(`Invalid order direction: ${direction}`)
      }

      return `"${column}" ${dir}`
    })

    query += ` ORDER BY ${orderParts.join(', ')}`
  }

  return query
}

module.exports = { generateSqlQuery, exportQueryToJsonFile }

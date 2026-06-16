const { Pool } = require('pg')
const { DefaultAzureCredential, getBearerTokenProvider } = require('@azure/identity')
const fs = require('fs')

async function getPassword () {
  try {
    const dbAuthEndpoint = 'https://ossrdbms-aad.database.windows.net/.default'
    const credential = new DefaultAzureCredential()
    const tokenProvider = getBearerTokenProvider(credential, dbAuthEndpoint)
    return await tokenProvider()
  } catch (error) {
    console.error('Failed to get AAD token:', error.message)
    throw error
  }
}

async function exportTableToCsv (tableName) {
  const password = await getPassword()

  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'ffc-pay-event-hub-postgres',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'ffc_pay_event_hub',
    user: process.env.POSTGRES_USERNAME,
    password,
    ssl: { rejectUnauthorized: false }
  })

  const client = await pool.connect()

  try {
    // Get column names and types
    const columnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName])

    const columns = columnsResult.rows
    if (columns.length === 0) {
      throw new Error(`Table ${tableName} not found`)
    }

    const columnNames = columns.map(col => col.column_name)

    // Create formatted select statement for CSV export (Oracle-compatible format)
    const selectClauses = columnNames.map(col => {
      const dataType = columns.find(c => c.column_name === col).data_type
      if (dataType.includes('timestamp') || dataType === 'date' || dataType === 'time') {
        return `COALESCE(TO_CHAR("${col}", 'YYYY-MM-DD HH24:MI:SS.MS'), '')`
      }
      return `COALESCE("${col}"::text, '')`
    }).join(', ')

    // Write CSV header
    const csvFile = fs.createWriteStream(`${tableName}.csv`)
    csvFile.write(columnNames.map(col => `"${col}"`).join(',') + '\n')

    // Stream results
    const query = `
      SELECT ${selectClauses}
      FROM public."${tableName}"
      ORDER BY id
      LIMIT 1000
    `

    const result = await client.query(query)

    result.rows.forEach(row => {
      const csvRow = columnNames.map(col => {
        const value = row[Object.keys(row)[columnNames.indexOf(col)]] || ''
        // Escape quotes and wrap in quotes if contains comma or quote
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
      csvFile.write(csvRow + '\n')
    })

    csvFile.end()

    return new Promise((resolve, reject) => {
      csvFile.on('finish', () => {
        console.log(`✓ Exported ${result.rows.length} rows from ${tableName} to ${tableName}.csv`)
        resolve()
      })
      csvFile.on('error', reject)
    })
  } finally {
    client.release()
    await pool.end()
  }
}

async function main () {
  const tables = ['batches', 'holds', 'payments', 'warnings']

  console.log('Starting export to CSV...')
  for (const table of tables) {
    try {
      await exportTableToCsv(table)
    } catch (error) {
      console.error(`✗ Error exporting ${table}:`, error.message)
    }
  }
  console.log('Export complete')
}

main().catch(console.error)

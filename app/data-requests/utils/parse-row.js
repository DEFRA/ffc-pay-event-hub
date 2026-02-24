const parseRow = (row) => {
  if (typeof row !== 'string') {
    return row
  }

  try {
    return JSON.parse(row)
  } catch {
    return row
  }
}

module.exports = { parseRow }

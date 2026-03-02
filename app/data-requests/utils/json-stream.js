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

const writeJsonRow = (stream, data, isFirstRowFlag) => {
  if (!isFirstRowFlag.value) {
    stream.write(',\n')
  }

  stream.write(JSON.stringify(data))
  isFirstRowFlag.value = false
}

const createReportProcessor = (transformRow) => (row, outputStream, isFirstRowFlag) => {
  const parsed = parseRow(row)

  if (parsed && typeof parsed === 'object') {
    const transformed = transformRow(parsed)
    writeJsonRow(outputStream, transformed, isFirstRowFlag)
  } else {
    writeJsonRow(outputStream, parsed, isFirstRowFlag)
  }
}

module.exports = {
  writeJsonRow,
  createReportProcessor,
  parseRow
}

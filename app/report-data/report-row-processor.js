const reportProcessingFunc = (row, outputStream, isFirstRow) => {
  const json = JSON.stringify(row)
  if (!isFirstRow.value) {
    outputStream.write(',\n')
  }
  outputStream.write(json)
  isFirstRow.value = false
}

module.exports = { reportProcessingFunc }

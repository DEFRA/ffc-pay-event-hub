const { writeDataRequestFile } = require('../../storage')
const { generateUniqueFilename } = require('./generate-unique-filename')

const persistExportFile = async (fileIdentifier, eventData) => {
  const payload = {
    data: eventData,
  }

  const filename = generateUniqueFilename(fileIdentifier)

  const blobUrl = await writeDataRequestFile(
    filename,
    JSON.stringify(payload)
  )

  return blobUrl
}

module.exports = { persistExportFile }

const generateUniqueFilename = (prefix = 'default', ext = 'json') => {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-')
  return `${prefix}-${timestamp}.${ext}`
}

module.exports = { generateUniqueFilename }

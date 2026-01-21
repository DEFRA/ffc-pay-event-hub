const getCacheKey = (category, value) => {
  return `${category}:${value}`
}

module.exports = {
  getCacheKey
}

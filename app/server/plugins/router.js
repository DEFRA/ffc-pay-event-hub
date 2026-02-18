const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/suppressed-report-data')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server) => {
      server.route(routes)
    }
  }
}

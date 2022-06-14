const ExportHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'export',
  version: '1.0.0',
  register: async (server, { validator, producerService, playlistsService }) => {
    const exportHandler = new ExportHandler({ validator, producerService, playlistsService })
    server.route(routes(exportHandler))
  }
}

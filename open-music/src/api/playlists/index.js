const PlaylistHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { playlistsService, validator }) => {
    const playlistsHandler = new PlaylistHandler({ playlistsService, validator })
    server.route(routes(playlistsHandler))
  }
}

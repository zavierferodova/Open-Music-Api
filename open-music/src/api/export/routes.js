const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{id}',
    handler: handler.exportPlaylist,
    options: {
      auth: 'openmusic_jwt'
    }
  }
]

module.exports = routes

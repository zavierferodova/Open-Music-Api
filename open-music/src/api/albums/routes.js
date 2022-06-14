const albumCoverPath = require('./albumCoverPath')

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.addAlbum
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbum
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.updateAlbum
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbum
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.uploadAlbumCover,
    config: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000
      }
    }
  },
  {
    method: 'GET',
    path: '/albums/covers/{param*}',
    handler: {
      directory: {
        path: albumCoverPath
      }
    }
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.likeUnlikeAlbum,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getNumberOfLikes
  }
]

module.exports = routes

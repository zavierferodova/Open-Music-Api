const routes = (handler) => [
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongs
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSong
  },
  {
    method: 'POST',
    path: '/songs',
    handler: handler.addSong
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.updateSong
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSong
  }
]

module.exports = routes

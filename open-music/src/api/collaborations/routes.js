const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.addCollaboration,
    options: {
      auth: 'openmusic_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaboration,
    options: {
      auth: 'openmusic_jwt'
    }
  }
]

module.exports = routes

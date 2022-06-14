const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.addUser
  },
  {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUser
  },
  {
    method: 'GET',
    path: '/users',
    handler: handler.getUsersByUsername
  }
]

module.exports = routes

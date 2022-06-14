const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.addAuthentication
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.updateAuthentication
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthentication
  }
]

module.exports = routes

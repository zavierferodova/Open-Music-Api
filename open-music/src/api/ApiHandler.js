const ClientError = require('../exceptions/ClientError')

class ApiHandler {
  /**
   * Make error response for api request
   * @param {*} error
   * @param {*} h
   * @returns
   */
  responseError (error, h) {
    if (error instanceof ClientError) {
      const response = h.response({
        status: 'fail',
        message: error.message
      })
      response.code(error.statusCode)
      return response
    }

    const response = h.response({
      status: 'error',
      message: 'Sorry, something went wrong in our server'
    })
    response.code(500)
    return response
  }
}

module.exports = ApiHandler

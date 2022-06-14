const ApiHandler = require('../ApiHandler')

class UserHandler extends ApiHandler {
  #service = null
  #validator = null

  constructor (service, validator) {
    super()
    this.#service = service
    this.#validator = validator

    this.addUser = this.addUser.bind(this)
    this.getUser = this.getUser.bind(this)
    this.getUsersByUsername = this.getUsersByUsername.bind(this)
  }

  /**
   * Api request handler to add new user
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async addUser (request, h) {
    try {
      this.#validator.validateUserPayload(request.payload)
      const { username, password, fullname } = request.payload
      const userId = await this.#service.addUser({ username, password, fullname })
      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          userId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to get user by id
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getUser (request, h) {
    try {
      const { id } = request.params
      const user = await this.#service.getUserById(id)
      return {
        status: 'success',
        data: {
          user
        }
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to search user by username
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getUsersByUsername (request, h) {
    try {
      const { username = '' } = request.query
      const users = await this.#service.getUsersByUsername(username)
      return {
        status: 'success',
        data: {
          users
        }
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }
}

module.exports = UserHandler

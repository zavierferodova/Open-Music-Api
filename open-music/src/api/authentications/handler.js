const ApiHandler = require('../ApiHandler')

class AuthenticationHandler extends ApiHandler {
  #authenticationsService = null
  #usersService = null
  #tokenManager = null
  #validator = null

  constructor (authenticationsService, usersService, tokenManager, validator) {
    super()
    this.#authenticationsService = authenticationsService
    this.#usersService = usersService
    this.#tokenManager = tokenManager
    this.#validator = validator

    this.addAuthentication = this.addAuthentication.bind(this)
    this.updateAuthentication = this.updateAuthentication.bind(this)
    this.deleteAuthentication = this.deleteAuthentication.bind(this)
  }

  /**
   * Api request handler to generate authentication
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async addAuthentication (request, h) {
    try {
      this.#validator.validatePostAuthenticationPayload(request.payload)
      const { username, password } = request.payload
      const id = await this.#usersService.verifyUserCredential(username, password)
      const accessToken = this.#tokenManager.generateAccessToken({ id })
      const refreshToken = this.#tokenManager.generateRefreshToken({ id })
      await this.#authenticationsService.addRefreshToken(refreshToken)
      const response = h.response({
        status: 'success',
        message: 'Success to add authentication',
        data: {
          accessToken,
          refreshToken
        }
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler for update refresh token
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async updateAuthentication (request, h) {
    try {
      this.#validator.validatePutAuthenticationPayload(request.payload)
      const { refreshToken } = request.payload
      await this.#authenticationsService.verifyRefreshToken(refreshToken)

      const { id } = this.#tokenManager.verifyRefreshToken(refreshToken)
      const accessToken = this.#tokenManager.generateAccessToken({ id })
      return {
        status: 'success',
        message: 'Access token has been updated',
        data: {
          accessToken
        }
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to delete refresh token
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async deleteAuthentication (request, h) {
    try {
      this.#validator.validateDeleteAuthenticationPayload(request.payload)
      const { refreshToken } = request.payload
      await this.#authenticationsService.verifyRefreshToken(refreshToken)
      await this.#authenticationsService.deleteRefreshToken(refreshToken)
      return {
        status: 'success',
        message: 'Success to delete authentication'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }
}

module.exports = AuthenticationHandler

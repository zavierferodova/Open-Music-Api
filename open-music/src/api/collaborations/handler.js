const ApiHandler = require('../ApiHandler')

class CollaborationHandler extends ApiHandler {
  #collaborationsService = null
  #playlistsService = null
  #usersService = null
  #validator = null

  constructor ({ collaborationsService, usersService, playlistsService, validator }) {
    super()
    this.#collaborationsService = collaborationsService
    this.#usersService = usersService
    this.#playlistsService = playlistsService
    this.#validator = validator

    this.addCollaboration = this.addCollaboration.bind(this)
    this.deleteCollaboration = this.deleteCollaboration.bind(this)
  }

  /**
   * Api request handler to add playlist collaboration
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async addCollaboration (request, h) {
    try {
      this.#validator.validateCollaborationPayload(request.payload)
      const { playlistId, userId } = request.payload
      const { id: credentialId } = request.auth.credentials
      await this.#playlistsService.verifyOwner(playlistId, credentialId)
      await this.#usersService.getUser(userId)
      const collaborationId = await this.#collaborationsService.addCollaboration(playlistId, userId)
      const response = h.response({
        status: 'success',
        data: {
          collaborationId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to delete playlist collaboration
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async deleteCollaboration (request, h) {
    try {
      this.#validator.validateCollaborationPayload(request.payload)
      const { playlistId, userId } = request.payload
      const { id: crendentialId } = request.auth.credentials
      await this.#playlistsService.verifyOwner(playlistId, crendentialId)
      await this.#usersService.getUser(userId)
      await this.#collaborationsService.deleteCollaboration(playlistId, userId)
      return {
        status: 'success',
        message: 'Collaboration deleted'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }
}

module.exports = CollaborationHandler

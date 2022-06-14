const ApiHandler = require('../ApiHandler')

class ExportHandler extends ApiHandler {
  #validator = null
  #producerService = null
  #playlistsService = null

  constructor ({ validator, producerService, playlistsService }) {
    super()
    this.#validator = validator
    this.#producerService = producerService
    this.#playlistsService = playlistsService

    this.exportPlaylist = this.exportPlaylist.bind(this)
  }

  /**
   * Api request handler to send request for exporting a playlist
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async exportPlaylist (request, h) {
    try {
      this.#validator.validateExportPlaylistPayload(request.payload)
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials
      const { targetEmail } = request.payload
      await this.#playlistsService.getPlaylistWithSongs(id)
      await this.#playlistsService.verifyOwner(id, credentialId)

      const message = {
        playlistId: id,
        targetEmail
      }

      await this.#producerService.sendMessage('export:playlist', JSON.stringify(message))

      const response = h.response({
        status: 'success',
        message: 'Your request has been sent to the queue'
      })
      response.code(201)

      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }
}

module.exports = ExportHandler

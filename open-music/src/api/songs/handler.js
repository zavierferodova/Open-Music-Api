const ApiHandler = require('../ApiHandler')

class SongsHandler extends ApiHandler {
  #service = null
  #validator = null

  constructor (service, validator) {
    super()
    this.#service = service
    this.#validator = validator

    this.getSong = this.getSong.bind(this)
    this.getSongs = this.getSongs.bind(this)
    this.addSong = this.addSong.bind(this)
    this.updateSong = this.updateSong.bind(this)
    this.deleteSong = this.deleteSong.bind(this)
  }

  /**
   * Api request handler to get song by id
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getSong (request, h) {
    try {
      const { id } = request.params
      const song = await this.#service.getSong(id)
      return {
        status: 'success',
        data: {
          song
        }
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to get all songs
   * @param {*} request
   * @returns
   */
  async getSongs (request) {
    const { title, performer } = request.query
    const songs = await this.#service.getSongs({ title, performer })
    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  /**
   * Api request handler to add song
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async addSong (request, h) {
    try {
      this.#validator.validateSongPayload(request.payload)
      const { title, year, genre, performer, duration, albumId } = request.payload
      const songId = await this.#service.addSong({ title, year, genre, performer, duration, albumId })
      const response = h.response({
        status: 'success',
        data: {
          songId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to update song
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async updateSong (request, h) {
    try {
      this.#validator.validateSongPayload(request.payload)
      const { id } = request.params
      const { title, year, genre, performer, duration, albumId } = request.payload
      await this.#service.updateSong(id, { title, year, genre, performer, duration, albumId })
      return {
        status: 'success',
        message: 'Song successfully updated'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to delete song
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async deleteSong (request, h) {
    try {
      const { id } = request.params
      await this.#service.deleteSong(id)
      return {
        status: 'success',
        message: 'Song successfully deleted'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }
}

module.exports = SongsHandler

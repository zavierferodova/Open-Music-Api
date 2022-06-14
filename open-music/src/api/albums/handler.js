const ApiHandler = require('../ApiHandler')

class AlbumsHandler extends ApiHandler {
  #service = null
  #storageService = null
  #validator = null
  #uploadsValidator = null

  constructor ({ service, storageService, validator, uploadsValidator }) {
    super()
    this.#service = service
    this.#storageService = storageService
    this.#validator = validator
    this.#uploadsValidator = uploadsValidator

    this.addAlbum = this.addAlbum.bind(this)
    this.getAlbum = this.getAlbum.bind(this)
    this.updateAlbum = this.updateAlbum.bind(this)
    this.deleteAlbum = this.deleteAlbum.bind(this)
    this.uploadAlbumCover = this.uploadAlbumCover.bind(this)
    this.likeUnlikeAlbum = this.likeUnlikeAlbum.bind(this)
    this.getNumberOfLikes = this.getNumberOfLikes.bind(this)
  }

  /**
   * Api request handler to get album by id
   * @param {*} request
   * @param {*} h
   */
  async getAlbum (request, h) {
    try {
      const { id } = request.params
      const album = await this.#service.getAlbum(id)
      album.coverUrl = null
      if (album.cover) {
        album.coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${album.cover}`
      }
      delete album.cover

      return {
        status: 'success',
        data: {
          album
        }
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to add album
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async addAlbum (request, h) {
    try {
      this.#validator.validateAlbumPayload(request.payload)
      const { name, year } = request.payload
      const albumId = await this.#service.addAlbum({ name, year })
      const response = h.response({
        status: 'success',
        data: {
          albumId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to update album
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async updateAlbum (request, h) {
    try {
      this.#validator.validateAlbumPayload(request.payload)
      const { id } = request.params
      const { name, year } = request.payload
      await this.#service.updateAlbum(id, { name, year })
      return {
        status: 'success',
        message: 'Album successfully updated'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to delete album
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async deleteAlbum (request, h) {
    try {
      const { id } = request.params
      await this.#service.deleteAlbum(id)
      return {
        status: 'success',
        message: 'Album successfully deleted'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to upload album cover image
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async uploadAlbumCover (request, h) {
    try {
      const { id } = request.params
      const { cover } = request.payload
      this.#uploadsValidator.validateImageHeaders(cover.hapi.headers)
      const filename = await this.#storageService.writeFile(cover, cover.hapi)
      await this.#service.setAlbumCover(id, filename)
      const response = h.response({
        status: 'success',
        message: 'Album cover uploaded'
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to perform like or unlike for an album
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async likeUnlikeAlbum (request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials
      const isAlbumLiked = await this.#service.isAlbumLiked(id, credentialId)
      if (!isAlbumLiked) {
        await this.#service.likeAlbum(id, credentialId)
        const response = h.response({
          status: 'success',
          message: 'Album liked'
        })
        response.code(201)
        return response
      } else {
        await this.#service.unlikeAlbum(id, credentialId)
        const response = h.response({
          status: 'success',
          message: 'Album unliked'
        })
        response.code(201)
        return response
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to get number of like for an album
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getNumberOfLikes (request, h) {
    try {
      const { id } = request.params
      let isFromCache = false
      let likes = 0

      try {
        likes = await this.#service.getCacheNumberOfLikes(id)
        isFromCache = true
      } catch {
        likes = await this.#service.getNumberOfLikes(id)
      }

      const response = h.response({
        status: 'success',
        data: {
          likes
        }
      })

      if (isFromCache) {
        response.header('X-Data-Source', 'cache')
      }

      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }
}

module.exports = AlbumsHandler

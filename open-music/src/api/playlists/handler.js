const ApiHandler = require('../ApiHandler')

class PlaylistHandler extends ApiHandler {
  #playlistsService = null
  #validator = null

  constructor ({ playlistsService, validator }) {
    super()
    this.#playlistsService = playlistsService
    this.#validator = validator

    this.addPlaylist = this.addPlaylist.bind(this)
    this.getPlaylists = this.getPlaylists.bind(this)
    this.deletePlaylist = this.deletePlaylist.bind(this)
    this.addSong = this.addSong.bind(this)
    this.getPlaylistWithSongs = this.getPlaylistWithSongs.bind(this)
    this.deleteSong = this.deleteSong.bind(this)
    this.getActivities = this.getActivities.bind(this)
  }

  /**
   * Api request handler to add playlist
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async addPlaylist (request, h) {
    try {
      this.#validator.validatePlaylistPayload(request.payload)
      const { name } = request.payload
      const { id: credentialId } = request.auth.credentials
      const playlistId = await this.#playlistsService.addPlaylist({ name, owner: credentialId })
      const response = h.response({
        status: 'success',
        data: {
          playlistId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to get playlist by owner id
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getPlaylists (request, h) {
    try {
      const { id: credentialId } = request.auth.credentials
      const playlists = await this.#playlistsService.getPlaylists(credentialId)
      return {
        status: 'success',
        data: {
          playlists
        }
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to delete playlist
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async deletePlaylist (request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials
      await this.#playlistsService.verifyOwner(id, credentialId)
      await this.#playlistsService.deletePlaylist(id)
      return {
        status: 'success',
        message: 'Playlist successfully deleted'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to add song on playlist
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async addSong (request, h) {
    try {
      this.#validator.validateAddSongPayload(request.payload)
      const { id } = request.params
      const { songId } = request.payload
      const { id: credentialId } = request.auth.credentials
      await this.#playlistsService.verifyAccess(id, credentialId)
      await this.#playlistsService.addSong(id, songId)
      await this.#playlistsService.addActivity({ playlistId: id, userId: credentialId, songId, action: 'add' })
      const response = h.response({
        status: 'success',
        message: 'Songs successfully added to playlist'
      })
      response.code(201)
      return response
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to get playlist with songs data
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getPlaylistWithSongs (request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials
      await this.#playlistsService.verifyAccess(id, credentialId)
      let playlist = await this.#playlistsService.getPlaylistWithSongs(id)
      let isFromCache = false

      try {
        playlist = await this.#playlistsService.getCachePlaylistWithSongs(id)
        isFromCache = true
      } catch {
        playlist = await this.#playlistsService.getPlaylistWithSongs(id)
      }

      const response = h.response({
        status: 'success',
        data: {
          playlist
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

  /**
   * Api request handler to delete song from playlist
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async deleteSong (request, h) {
    try {
      this.#validator.validateDeleteSongPayload(request.payload)
      const { songId } = request.payload
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials
      await this.#playlistsService.verifyAccess(id, credentialId)
      await this.#playlistsService.deleteSong(id, songId)
      await this.#playlistsService.addActivity({ playlistId: id, userId: credentialId, songId, action: 'delete' })
      return {
        status: 'success',
        message: 'Song deleted from playlist'
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }

  /**
   * Api request handler to get playlist activities
   * @param {*} request
   * @param {*} h
   * @returns
   */
  async getActivities (request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials
      await this.#playlistsService.verifyAccess(id, credentialId)
      const activities = await this.#playlistsService.getActivities(id)
      return {
        status: 'success',
        data: {
          playlistId: id,
          activities
        }
      }
    } catch (error) {
      return this.responseError(error, h)
    }
  }
}

module.exports = PlaylistHandler

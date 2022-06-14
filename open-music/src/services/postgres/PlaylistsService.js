const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  #pool = null
  #songsService = null
  #collaborationsService = null
  #cacheService = null

  constructor ({ songsService, collaborationsService, cacheService }) {
    this.#songsService = songsService
    this.#collaborationsService = collaborationsService
    this.#cacheService = cacheService
    this.#pool = new Pool()
  }

  /**
   * Save new playlist to database
   * @param {object} playlist
   * @param {string} playlist.name
   * @param {string} playlist.owner
   */
  async addPlaylist ({ name, owner }) {
    const id = `playlist-${nanoid(11)}`
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this.#pool.query(query)
    if (!result.rows.length) {
      throw new InvariantError('Failed to add playlist')
    }

    return result.rows[0].id
  }

  /**
   * Get playlists by user id
   * @param {string} owner
   */
  async getPlaylists (owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      INNER JOIN users ON playlists.owner = users.id
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner]
    }

    const result = await this.#pool.query(query)
    return result.rows
  }

  /**
   * Delete playlist from database
   * @param {string} playlistId
   */
  async deletePlaylist (playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete playlist, playlist not found')
    }

    await this.#cacheService.delete(`playlist:${playlistId}`)
  }

  /**
   * Get cache response for playlist
   * @param {string} playlistId
   * @returns
   */
  async getCachePlaylistWithSongs (playlistId) {
    const playlist = await this.#cacheService.get(`playlist:${playlistId}`)
    return JSON.parse(playlist)
  }

  /**
   * Get all songs by playlist id
   * @param {string} playlistId
   */
  async getPlaylistWithSongs (playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
        INNER JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1`,
      values: [playlistId]
    }

    const result = await this.#pool.query(query)
    const playlist = result.rows[0]

    if (!result.rows.length) {
      throw new NotFoundError('Failed to get songs, playlist not found')
    }

    const querySong = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs 
        INNER JOIN songs ON playlist_songs.song_id = songs.id
        WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId]
    }
    const resultSongs = await this.#pool.query(querySong)

    playlist.songs = resultSongs.rows
    await this.#cacheService.set(`playlist:${playlistId}`, JSON.stringify(playlist), 30 * 60)
    return playlist
  }

  /**
   * Add song to playlist
   * @param {string} playlistId
   * @param {string} songId
   * @returns
   */
  async addSong (playlistId, songId) {
    await this.#songsService.getSong(songId)

    const id = nanoid(20)
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed add song to playlist')
    }

    await this.#cacheService.delete(`playlist:${playlistId}`)
    return result.rows[0].id
  }

  /**
   * Delete song from playlist
   * @param {string} playlistId
   * @param {string} songId
   */
  async deleteSong (playlistId, songId) {
    await this.#songsService.getSong(songId)

    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed to delete song from playlist')
    }

    await this.#cacheService.delete(`playlist:${playlistId}`)
  }

  /**
   * Verify playlist owner
   * @param {string} id
   * @param {string} owner
   */
  async verifyOwner (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found')
    }

    const playlist = result.rows[0]
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Sorry you cannot access this resource')
    }
  }

  /**
   * Verify playlist access
   * @param {string} playlistId
   * @param {string} userId
   */
  async verifyAccess (playlistId, userId) {
    try {
      await this.verifyOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      try {
        await this.#collaborationsService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }

  /**
   * Store activity to database
   * @param {object} data
   * @param {string} data.playlistId
   * @param {string} data.userId
   * @param {string} data.songId
   * @param {string} data.action
   * @returns
   */
  async addActivity ({ playlistId, userId, songId, action }) {
    const id = nanoid(20)
    const time = new Date().toISOString()
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed to add activity')
    }

    return id
  }

  /**
   * Get activities record by playlist id
   * @param {string} playlistId
   * @returns
   */
  async getActivities (playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed to get activities, playlist not found')
    }

    const queryActivities = {
      text: `SELECT users.username, songs.title, activities.action, activities.time
        FROM playlist_song_activities AS activities
        INNER JOIN songs ON activities.song_id = songs.id
        INNER JOIN users ON activities.user_id = users.id
        WHERE activities.playlist_id = $1`,
      values: [playlistId]
    }

    const resultActivities = await this.#pool.query(queryActivities)

    return resultActivities.rows
  }
}

module.exports = PlaylistsService

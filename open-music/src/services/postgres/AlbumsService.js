const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/models/SongModel')

class AlbumsService {
  #pool = null
  #cacheService = null

  constructor (cacheService) {
    this.#pool = new Pool()
    this.#cacheService = cacheService
  }

  /**
   * Add new album to database
   * @param {object} album
   * @param {string} album.name
   * @param {number} album.number
   */
  async addAlbum ({ name, year }) {
    const id = `album-${nanoid(14)}`
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this.#pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add album')
    }

    return id
  }

  /**
   * Get album by id
   * @param {string} id
   * @returns
   */
  async getAlbum (id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album not found')
    }

    const songQuery = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id]
    }

    const songs = await this.#pool.query(songQuery)
    const album = result.rows[0]
    album.songs = songs.rows.map(mapDBToModel)

    return album
  }

  /**
   * Update album data
   * @param {string} id
   * @param {object} album
   * @param {string} album.name
   * @param {string} album.year
   */
  async updateAlbum (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update, album not found')
    }
  }

  /**
   * Set cover filename for an album
   * @param {string} albumId
   * @param {string} cover
   */
  async setAlbumCover (id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update, album not found')
    }
  }

  /**
   * Delete album from database
   * @param {string} id
   */
  async deleteAlbum (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete, album not found')
    }
  }

  /**
   * Save a like for an album to database
   * @param {string} albumId
   * @param {string} userId
   */
  async likeAlbum (albumId, userId) {
    const id = nanoid(20)
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed to like album')
    }

    await this.#cacheService.delete(`album_likes:${albumId}`)
    return result.rows[0].id
  }

  /**
   * Delete a like for an album from database
   * @param {string} albumId
   * @param {string} userId
   */
  async unlikeAlbum (albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed to unlike album')
    }

    await this.#cacheService.delete(`album_likes:${albumId}`)
    return result.rows[0].id
  }

  /**
   * Check if a user has liked an album
   * @param {string} albumId
   * @param {string} userId
   * @returns
   */
  async isAlbumLiked (albumId, userId) {
    await this.getAlbum(albumId)
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      return false
    }

    return true
  }

  /**
   * Get cached number of likes for an album
   * @param {string} albumId
   * @returns
   */
  async getCacheNumberOfLikes (albumId) {
    const ammounts = await this.#cacheService.get(`album_likes:${albumId}`)
    return Number(ammounts)
  }

  /**
   * Count the number of likes for an album
   * @param {string} albumId
   * @returns
   */
  async getNumberOfLikes (albumId) {
    await this.getAlbum(albumId)
    const query = {
      text: 'SELECT COUNT(*) AS ammounts FROM user_album_likes WHERE album_id = $1 LIMIT 1',
      values: [albumId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed to get number of likes')
    }

    const likeAmmounts = Number(result.rows[0].ammounts)
    await this.#cacheService.set(`album_likes:${albumId}`, likeAmmounts, 30 * 60) // set cache for 30 minutes
    return likeAmmounts
  }
}

module.exports = AlbumsService

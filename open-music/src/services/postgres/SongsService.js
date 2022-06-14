const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/models/SongModel')

class SongsService {
  #pool = null

  constructor () {
    this.#pool = new Pool()
  }

  /**
   * Add new song to database
   * @param {object} song
   * @param {string} song.title
   * @param {number} song.year
   * @param {string} song.genre
   * @param {string} song.performer
   * @param {number=} song.duration
   * @param {string=} song.albumId
   */
  async addSong ({ title, year, genre, performer, duration = 0, albumId }) {
    const id = `song-${nanoid(15)}`
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, albumId, title, year, genre, performer, duration]
    }

    const result = await this.#pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song')
    }

    return id
  }

  /**
   * Get all song
   * @param {object} search
   * @param {string} search.title
   * @param {string} search.performer
   * @returns
   */
  async getSongs ({ title, performer }) {
    const query = {
      text: 'SELECT id, title, performer From songs',
      values: []
    }

    if (title) {
      query.text += ' WHERE LOWER(title) LIKE $1'
      query.values = [`%${title.toLowerCase()}%`]
    }

    if (performer) {
      if (title) {
        query.text += ' AND LOWER(performer) LIKE $2'
      } else {
        query.text += ' WHERE LOWER(performer) LIKE $1'
      }
      query.values.push(`%${performer.toLowerCase()}%`)
    }

    const result = await this.#pool.query(query)
    return result.rows.map(mapDBToModel)
  }

  /**
   * Get song by id
   * @param {string} id
   * @returns
   */
  async getSong (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Song not found')
    }

    return mapDBToModel(result.rows[0])
  }

  /**
   * Update song data
   * @param {object} song
   * @param {string} song.title
   * @param {number} song.year
   * @param {string} song.genre
   * @param {string} song.performer
   * @param {number=} song.duration
   * @param {string=} song.albumId
   */
  async updateSong (id, { title, year, genre, performer, duration = 0, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id]
    }

    const result = await this.#pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Failed to update, song not found')
    }
  }

  /**
   * Delete song from database
   * @param {string} id
   */
  async deleteSong (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this.#pool.query(query)
    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete, song not found')
    }
  }
}

module.exports = SongsService

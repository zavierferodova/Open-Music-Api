const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class CollaborationsService {
  #pool = null

  constructor () {
    this.#pool = new Pool()
  }

  /**
   * Save collaboration to database
   * @param {string} playlistId
   * @param {string} userId
   * @returns
   */
  async addCollaboration (playlistId, userId) {
    const id = nanoid(20)
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId]
    }

    const result = await this.#pool.query(query)
    if (!result.rows.length) {
      throw new InvariantError('Failed to add collaboration')
    }

    return result.rows[0].id
  }

  /**
   * Delete collaboration data from database
   * @param {string} playlistId
   * @param {string} userId
   */
  async deleteCollaboration (playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete, collaboration not found')
    }
  }

  /**
   * Verify collaboration access
   * @param {string} playlistId
   * @param {string} userId
   */
  async verifyCollaborator (playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed to verify collaboration')
    }
  }
}

module.exports = CollaborationsService

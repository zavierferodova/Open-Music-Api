const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')

class AuthenticationService {
  #pool = null

  constructor () {
    this.#pool = new Pool()
  }

  /**
   * Add refresh token to database
   * @param {string} token
   */
  async addRefreshToken (token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token]
    }

    await this.#pool.query(query)
  }

  /**
   * Verify refresh token is exist in database
   * @param {string} token
   */
  async verifyRefreshToken (token) {
    const query = {
      text: 'SELECT * FROM authentications WHERE token = $1',
      values: [token]
    }

    const result = await this.#pool.query(query)
    if (!result.rows.length) {
      throw new InvariantError('Invalid refresh token')
    }
  }

  /**
   * Delete refresh token from database
   * @param {string} token
   */
  async deleteRefreshToken (token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token]
    }

    await this.#pool.query(query)
  }
}

module.exports = AuthenticationService

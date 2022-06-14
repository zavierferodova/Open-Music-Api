const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthenticationError = require('../../exceptions/AuthenticationError')

class UserService {
  #pool = null

  constructor () {
    this.#pool = new Pool()
  }

  /**
   * Add new user to database
   * @param {object} User
   * @param {string} User.username
   * @param {string} User.password
   * @param {string} User.fullname
   * @returns
   */
  async addUser ({ username, password, fullname }) {
    await this.verifyNewUsername(username)
    const id = `user-${nanoid(15)}`
    const hashedPassword = await bcrypt.hash(password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Failed add user')
    }

    return result.rows[0].id
  }

  /**
   * Check username availability
   * @param {string} username
   */
  async verifyNewUsername (username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this.#pool.query(query)

    if (result.rows.length > 0) {
      throw new InvariantError('Failed username not exists')
    }
  }

  /**
   * Get user by id
   * @param {string} id
   * @returns
   */
  async getUser (id) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('User not found')
    }

    return result.rows[0]
  }

  /**
   * Search user using username
   * @param {string} username
   * @returns
   */
  async getUsersByUsername (username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`]
    }
    const result = await this.#pool.query(query)
    return result.rows
  }

  /**
   * Authorize user credential
   * @param {string} username
   * @param {string} password
   * @returns
   */
  async verifyUserCredential (username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this.#pool.query(query)

    if (!result.rows.length) {
      throw new AuthenticationError('Your credential input is wrong')
    }

    const { id, password: hashedPassword } = result.rows[0]
    const match = await bcrypt.compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Your credential input is wrong')
    }

    return id
  }
}

module.exports = UserService

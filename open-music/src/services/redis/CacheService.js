const redis = require('redis')

class CacheService {
  constructor () {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER
      }
    })

    this._client.on('error', (error) => {
      console.error(error)
    })

    this._client.connect()
  }

  /**
   * Set cache to redis
   * @param {*} key
   * @param {*} value
   * @param {number} expirationInSecond
   */
  async set (key, value, expirationInSecond = 3600) {
    await this._client.set(key, value, {
      EX: expirationInSecond
    })
  }

  /**
   * Get cache from redis
   * @param {*} key
   * @returns
   */
  async get (key) {
    const result = await this._client.get(key)
    if (result == null) throw new Error('Cache not found')
    return result
  }

  /**
   * Delete cache from redis
   * @param {*} key
   * @returns
   */
  delete (key) {
    return this._client.del(key)
  }
}

module.exports = CacheService

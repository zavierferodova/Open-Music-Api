const Jwt = require('@hapi/jwt')
const InvariantError = require('../exceptions/InvariantError')

const { ACCESS_TOKEN_KEY } = process.env
const { REFRESH_TOKEN_KEY } = process.env

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken)
      Jwt.token.verifySignature(artifacts, REFRESH_TOKEN_KEY)
      const { payload } = artifacts.decoded
      return payload
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }
}

module.exports = TokenManager

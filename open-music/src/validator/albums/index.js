const { AlbumPayloadSchema } = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const result = AlbumPayloadSchema.validate(payload)

    if (result.error) {
      throw new InvariantError(result.error.message)
    }
  }
}

module.exports = AlbumValidator

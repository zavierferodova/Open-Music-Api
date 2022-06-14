const { SongPayloadSchema } = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const SongValidator = {
  validateSongPayload: (payload) => {
    const result = SongPayloadSchema.validate(payload)

    if (result.error) {
      throw new InvariantError(result.error.message)
    }
  }
}

module.exports = SongValidator

const InvariantError = require('../../exceptions/InvariantError')
const { PlaylistPayloadSchema, AddSongPayloadSchema, DeleteSongPayloadSchema } = require('./schema')

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateAddSongPayload: (payload) => {
    const validationResult = AddSongPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateDeleteSongPayload: (payload) => {
    const validationResult = DeleteSongPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = PlaylistsValidator

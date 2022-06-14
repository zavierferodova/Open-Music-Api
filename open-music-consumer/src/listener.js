class Listener {
  #playlistsService = null
  #mailSender = null

  constructor (playlistsService, mailSender) {
    this.#playlistsService = playlistsService
    this.#mailSender = mailSender

    this.listenExportPlaylist = this.listenExportPlaylist.bind(this)
  }

  /**
   * Message broker listener for export playlist
   * @param {*} message
   */
  async listenExportPlaylist (message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString())
      const playlist = await this.#playlistsService.getPlaylistWithSongs(playlistId)
      const content = {
        playlist: {
          ...playlist
        }
      }
      const result = await this.#mailSender.sendExportPlaylistMail(targetEmail, JSON.stringify(content))
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = Listener

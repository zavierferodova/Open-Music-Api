const { Pool } = require('pg')

class PlaylistsService {
  #pool = null

  constructor () {
    this.#pool = new Pool()
  }

  /**
   * Get all songs by playlist id
   * @param {string} playlistId
   */
  async getPlaylistWithSongs (playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name FROM playlists
        INNER JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1`,
      values: [playlistId]
    }

    const result = await this.#pool.query(query)
    const playlist = result.rows[0]

    if (!result.rows.length) {
      throw new Error('Failed to get songs, playlist not found')
    }

    const querySong = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlist_songs 
        INNER JOIN songs ON playlist_songs.song_id = songs.id
        WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId]
    }
    const resultSongs = await this.#pool.query(querySong)

    playlist.songs = resultSongs.rows
    return playlist
  }
}

module.exports = PlaylistsService

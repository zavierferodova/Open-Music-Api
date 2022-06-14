exports.up = pgm => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(20)',
      notNull: true,
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(20)',
      notNull: true
    },
    song_id: {
      type: 'VARCHAR(20)',
      notNull: true
    }
  })

  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', 'FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_songs', 'fk_playlist.songs_id_songs.id', 'FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('playlist_songs')
}

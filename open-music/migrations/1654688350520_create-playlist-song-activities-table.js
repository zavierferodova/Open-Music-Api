exports.up = pgm => {
  pgm.createTable('playlist_song_activities', {
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
    },
    user_id: {
      type: 'VARCHAR(20)',
      notNull: true
    },
    action: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    time: {
      type: 'VARCHAR(255)',
      notNull: true
    }
  })

  pgm.addConstraint('playlist_song_activities', 'playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_song_activities', 'playlist_song_activities.song_id_songs.id', 'FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_song_activities', 'playlist_song_activities.user_id_users.id', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('playlist_song_activities')
}

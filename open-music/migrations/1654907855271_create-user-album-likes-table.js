exports.up = pgm => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(20)',
      notNull: true,
      primaryKey: true
    },
    user_id: {
      type: 'VARCHAR(20)',
      notNull: true
    },
    album_id: {
      type: 'VARCHAR(20)',
      notNUll: true
    }
  })

  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.user_id_users.id', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE')
  pgm.addConstraint('user_album_likes', 'fk_user_album_likes.album_id_albums.id', 'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropTable('user_album_likes')
}

exports.up = pgm => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(20)',
      notNull: true,
      primaryKey: true
    },
    album_id: {
      type: 'VARCHAR(20)',
      references: '"albums"',
      onDelete: 'CASCADE'
    },
    title: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    year: {
      type: 'SMALLINT',
      notNull: true
    },
    genre: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    performer: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    duration: {
      type: 'INT'
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('songs')
}

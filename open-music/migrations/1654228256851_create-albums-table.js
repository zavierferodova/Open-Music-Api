exports.up = pgm => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(20)',
      notNull: true,
      primaryKey: true
    },
    name: {
      type: 'VARCHAR(255)',
      notNull: true
    },
    year: {
      type: 'SMALLINT'
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('albums')
}

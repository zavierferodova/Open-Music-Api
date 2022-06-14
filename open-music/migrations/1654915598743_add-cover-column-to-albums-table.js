exports.up = pgm => {
  pgm.addColumns('albums', {
    cover: {
      type: 'VARCHAR(255)',
      notNull: false
    }
  })
}

exports.down = pgm => {
  pgm.dropColumns('albums', ['cover'])
}

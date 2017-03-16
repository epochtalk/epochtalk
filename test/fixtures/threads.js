var path = require('path');
var fake = require(path.join(__dirname, '..', 'seed', 'fake'));

// self-reference using a string
// ex: 'users.0'
module.exports = {
  run: [
    'users',
    'categories',
    'boards',
    'threads'
  ],
  methods: {
    users: fake.users,
    categories: fake.categories,
    boards: fake.boards,
    threads: fake.threads
  },
  data: {
    categories: [
      {},
      {},
      {},
      {}
    ],
    boards: [
      {}, // has children boards.1,2,3
      {},
      {},
      {},
      {}
    ],
    threads: [
      { board_id: 'boards.0.id' },
      { board_id: 'boards.0.id' },
      { board_id: 'boards.0.id' },
      { board_id: 'boards.1.id' },
      { board_id: 'boards.1.id' },
      { board_id: 'boards.1.id' },
      { board_id: 'boards.2.id' },
      { board_id: 'boards.2.id' },
      { board_id: 'boards.2.id' }
    ]
  }
};

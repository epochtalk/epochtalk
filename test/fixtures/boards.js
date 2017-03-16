var path = require('path');
var fake = require(path.join(__dirname, '..', 'seed', 'fake'));

// self-reference using a string
// ex: 'users.0'
module.exports = {
  run: [
    'categories',
    'boards'
  ],
  methods: {
    categories: fake.categories,
    boards: fake.boards
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
    ]
  }
};

var path = require('path');
var fake = require(path.join(__dirname, '..', 'seed', 'fake'));

// self-reference using a string
// ex: 'users.0'
module.exports = {
  run: [
    'categories'
  ],
  methods: {
    categories : fake.categories
  },
  data: {
    categories: [
      {},
      {},
      {},
      {}
    ]
  }
};

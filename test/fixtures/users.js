var path = require('path');
var fake = require(path.join(__dirname, '..', 'seed', 'fake'));

// self-reference using a string
// ex: 'users.0'
module.exports = {
  run: [
    'users'
  ],
  methods: {
    users: fake.users
  },
  data: {
    users: [
      {},
      {},
      {},
      {}
    ]
  }
};

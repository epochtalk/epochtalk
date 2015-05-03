var path = require('path');
var users = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/users', config: users.page },
  { method: 'GET', path: '/users/{username}', config: users.find },
  { method: 'POST', path: '/users', config: users.update }
];

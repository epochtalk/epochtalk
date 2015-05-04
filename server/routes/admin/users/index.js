var path = require('path');
var users = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/users', config: users.page },
  { method: 'GET', path: '/users/count', config: users.count },
  { method: 'GET', path: '/users/{username}', config: users.find },
  { method: 'PUT', path: '/users', config: users.update }
];

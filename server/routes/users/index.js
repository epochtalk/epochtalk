var path = require('path');
var users = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'POST', path: '/users', config: users.create },
  { method: 'GET', path: '/users/{id}', config: users.find },
  { method: 'PUT', path: '/users', config: users.update },
  { method: 'GET', path: '/users/all', config: users.all },
  { method: 'POST', path: '/users/import', config: users.import }
];

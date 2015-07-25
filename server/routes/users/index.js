var path = require('path');
var users = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'GET', path: '/users/{id}', config: users.find },
  { method: 'PUT', path: '/users', config: users.update },
  { method: 'POST', path: '/users/import', config: users.import },
  { method: 'POST', path: '/users/{id}/deactivate', config: users.deactivate },
  { method: 'POST', path: '/users/{id}/reactivate', config: users.reactivate },
  { method: 'DELETE', path: '/users/{id}', config: users.delete }
];

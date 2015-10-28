var path = require('path');
var roles = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/roles/all', config: roles.all },
  { method: 'GET', path: '/roles/{id}/users', config: roles.users },
  { method: 'POST', path: '/roles/add', config: roles.add },
  { method: 'PUT', path: '/roles/update', config: roles.update },
  { method: 'PUT', path: '/roles/reprioritize', config: roles.reprioritize },
  { method: 'DELETE', path: '/roles/remove/{id}', config: roles.remove }
];

var users = require(__dirname + '/configs/users');

module.exports = [
  { method: 'POST', path: '/users', config: users.create },
  { method: 'GET', path: '/users/{id}', config: users.find },
  { method: 'PUT', path: '/users', config: users.update },
  // POST IMPORT
  { method: 'POST', path: '/users/import', config: users.import }
];

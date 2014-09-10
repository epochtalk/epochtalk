var users = require(__dirname + '/configs/users');

module.exports = [
  { method: 'POST', path: '/users', config: users.create },
  { method: 'GET', path: '/users/{id}', config: users.find },
  { method: 'GET', path: '/users/', config: users.find }
];
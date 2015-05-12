var path = require('path');
var users = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/users', config: users.page },
  { method: 'GET', path: '/users/search', config: users.searchUsernames },
  { method: 'GET', path: '/users/admins', config: users.pageAdmins },
  { method: 'GET', path: '/users/moderators', config: users.pageModerators },
  { method: 'GET', path: '/users/count', config: users.count },
  { method: 'GET', path: '/users/admins/count', config: users.countAdmins },
  { method: 'GET', path: '/users/moderators/count', config: users.countModerators },
  { method: 'GET', path: '/users/{username}', config: users.find },
  { method: 'PUT', path: '/users', config: users.update },
  { method: 'PUT', path: '/users/role', config: users.addRole }
];

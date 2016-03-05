var path = require('path');
var users = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/users', config: users.page },
  { method: 'GET', path: '/users/search', config: users.searchUsernames },
  { method: 'GET', path: '/users/count', config: users.count },
  { method: 'GET', path: '/users/{username}', config: users.find },
  { method: 'GET', path: '/users/{username}/bannedboards', config: users.getBannedBoards },
  { method: 'GET', path: '/users/banned', config: users.byBannedBoards },
  { method: 'PUT', path: '/users', config: users.update },
  { method: 'PUT', path: '/users/roles/add', config: users.addRoles },
  { method: 'PUT', path: '/users/roles/remove', config: users.removeRoles },
  { method: 'PUT', path: '/users/ban', config: users.ban },
  { method: 'PUT', path: '/users/unban', config: users.unban },
  { method: 'PUT', path: '/users/ban/boards', config: users.banFromBoards },
  { method: 'PUT', path: '/users/unban/boards', config: users.unbanFromBoards }
];

var path = require('path');
var bans = require(path.normalize(__dirname + '/config'));

module.exports = [
  // Banned Addresses
  { method: 'POST', path: '/ban/addresses', config: bans.addAddresses },
  { method: 'PUT', path: '/ban/addresses', config: bans.editAddress },
  { method: 'DELETE', path: '/ban/addresses', config: bans.deleteAddress },
  { method: 'GET', path: '/ban/addresses', config: bans.pageBannedAddresses },
  // Ban User Accounts
  { method: 'PUT', path: '/users/ban', config: bans.ban },
  { method: 'PUT', path: '/users/unban', config: bans.unban },
  // Ban User From Boards
  { method: 'PUT', path: '/users/ban/boards', config: bans.banFromBoards },
  { method: 'PUT', path: '/users/unban/boards', config: bans.unbanFromBoards },
  { method: 'GET', path: '/users/{username}/bannedboards', config: bans.getBannedBoards },
  { method: 'GET', path: '/users/banned', config: bans.byBannedBoards },
];

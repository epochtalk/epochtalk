var path = require('path');

module.exports = [
  {
    name: 'auth.bans.addAddresses',
    method: require(path.normalize(__dirname + '/addAddresses'))
  },
  {
    name: 'auth.bans.ban',
    method: require(path.normalize(__dirname + '/ban'))
  },
  {
    name: 'auth.bans.banFromBoards',
    method: require(path.normalize(__dirname + '/banFromBoards'))
  },
  {
    name: 'auth.bans.byBannedBoards',
    method: require(path.normalize(__dirname + '/byBannedBoards'))
  },
  {
    name: 'auth.bans.deleteAddress',
    method: require(path.normalize(__dirname + '/deleteAddress'))
  },
  {
    name: 'auth.bans.editAddress',
    method: require(path.normalize(__dirname + '/deleteAddress'))
  },
  {
    name: 'auth.bans.getBannedBoards',
    method: require(path.normalize(__dirname + '/getBannedBoards'))
  },
  {
    name: 'auth.bans.pageBannedAddresses',
    method: require(path.normalize(__dirname + '/pageBannedAddresses'))
  }
];

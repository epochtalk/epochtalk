var path = require('path');

module.exports = [
  {
    name: 'auth.bans.addAddresses',
    method: require(path.normalize(__dirname + '/addAddresses')),
    options: { callback: false }
  },
  {
    name: 'auth.bans.ban',
    method: require(path.normalize(__dirname + '/ban')),
    options: { callback: false }
  },
  {
    name: 'auth.bans.banFromBoards',
    method: require(path.normalize(__dirname + '/banFromBoards')),
    options: { callback: false }
  },
  {
    name: 'auth.bans.byBannedBoards',
    method: require(path.normalize(__dirname + '/byBannedBoards')),
    options: { callback: false }
  },
  {
    name: 'auth.bans.deleteAddress',
    method: require(path.normalize(__dirname + '/deleteAddress')),
    options: { callback: false }
  },
  {
    name: 'auth.bans.editAddress',
    method: require(path.normalize(__dirname + '/deleteAddress')),
    options: { callback: false }
  },
  {
    name: 'auth.bans.getBannedBoards',
    method: require(path.normalize(__dirname + '/getBannedBoards')),
    options: { callback: false }
  },
  {
    name: 'auth.bans.pageBannedAddresses',
    method: require(path.normalize(__dirname + '/pageBannedAddresses')),
    options: { callback: false }
  }
];

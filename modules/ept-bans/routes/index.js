var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/addAddresses')),
  require(path.normalize(__dirname + '/ban')),
  require(path.normalize(__dirname + '/banFromBoards')),
  require(path.normalize(__dirname + '/byBannedBoards')),
  require(path.normalize(__dirname + '/deleteAddress')),
  require(path.normalize(__dirname + '/editAddress')),
  require(path.normalize(__dirname + '/getBannedBoards')),
  require(path.normalize(__dirname + '/pageBannedAddresses')),
  require(path.normalize(__dirname + '/unban')),
  require(path.normalize(__dirname + '/unbanFromBoards'))
];

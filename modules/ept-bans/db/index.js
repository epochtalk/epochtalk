var path = require('path');

module.exports = {
  addAddresses: require(path.normalize(__dirname + '/addAddresses')),
  ban: require(path.normalize(__dirname + '/ban')),
  banFromBoards: require(path.normalize(__dirname + '/banFromBoards')),
  byBannedBoards: require(path.normalize(__dirname + '/byBannedBoards')),
  copyUserIps: require(path.normalize(__dirname + '/copyUserIps')),
  deleteAddress: require(path.normalize(__dirname + '/deleteAddress')),
  editAddress: require(path.normalize(__dirname + '/editAddress')),
  getBannedBoards: require(path.normalize(__dirname + '/getBannedBoards')),
  getMaliciousScore: require(path.normalize(__dirname + '/getMaliciousScore')),
  isNotBannedFromBoards: require(path.normalize(__dirname + '/isNotBannedFromBoard')),
  pageBannedAddresses: require(path.normalize(__dirname + '/pageBannedAddresses')),
  unban: require(path.normalize(__dirname + '/unban')),
  unbanFromBoards: require(path.normalize(__dirname + '/unbanFromBoards')),
};

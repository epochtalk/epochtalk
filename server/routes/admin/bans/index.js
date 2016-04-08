var path = require('path');
var bans = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'PUT', path: '/ban/addresses', config: bans.addAddresses },
  { method: 'GET', path: '/ban/addresses', config: bans.pageBannedAddresses }
];

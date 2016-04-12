var path = require('path');
var bans = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/ban/addresses', config: bans.addAddresses },
  { method: 'PUT', path: '/ban/addresses', config: bans.editAddress },
  { method: 'DELETE', path: '/ban/addresses', config: bans.deleteAddress },
  { method: 'GET', path: '/ban/addresses', config: bans.pageBannedAddresses }
];

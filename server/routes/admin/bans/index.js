var path = require('path');
var bans = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/ban/addresses', config: bans.addAddresses }
];

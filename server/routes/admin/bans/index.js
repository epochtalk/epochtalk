var path = require('path');
var bans = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/users/malicious', config: bans.getMaliciousScore },
  { method: 'POST', path: '/bannedaddress', config: bans.addAddress }
];

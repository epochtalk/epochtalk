var path = require('path');
var legal = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'GET', path: '/legal', config: legal.text },
  { method: 'PUT', path: '/legal', config: legal.update },
  { method: 'POST', path: '/legal/reset', config: legal.reset },
];

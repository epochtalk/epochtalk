var path = require('path');

module.exports = [
  {
    name: 'auth.configurations.get',
    method: require(path.normalize(__dirname + '/get')),
    options: { callback: false }
  },
  {
    name: 'auth.configurations.update',
    method: require(path.normalize(__dirname + '/update')),
    options: { callback: false }
  }
];

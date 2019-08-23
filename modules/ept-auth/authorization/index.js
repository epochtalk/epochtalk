var path = require('path');

module.exports = [
  {
    name: 'auth.auth.register',
    method: require(path.normalize(__dirname + '/register'))
  }
];

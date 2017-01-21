var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/login')),
  require(path.normalize(__dirname + '/logout')),
  require(path.normalize(__dirname + '/register')),
  require(path.normalize(__dirname + '/confirm')),
  require(path.normalize(__dirname + '/authenticate')),
  require(path.normalize(__dirname + '/username')),
  require(path.normalize(__dirname + '/email')),
  require(path.normalize(__dirname + '/recover-html')),
  require(path.normalize(__dirname + '/recover')),
  require(path.normalize(__dirname + '/reset')),
  require(path.normalize(__dirname + '/checkResetToken')),
  require(path.normalize(__dirname + '/adminRecover')),
  require(path.normalize(__dirname + '/invite-register'))
];

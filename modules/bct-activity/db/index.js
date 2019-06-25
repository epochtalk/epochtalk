var path = require('path');

module.exports = {
  userActivity: require(path.normalize(__dirname + '/userActivity')),
  updateUserActivity: require(path.normalize(__dirname + '/updateUserActivity'))
};

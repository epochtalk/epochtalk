var path = require('path');
var users = require(path.normalize(__dirname + '/../modules/ept-users'));

module.exports = {
  users: users.db
};

var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  latest: require(path.normalize(__dirname + '/latest')),
  delete: require(path.normalize(__dirname + '/delete')),
  findUser: require(path.normalize(__dirname + '/findUser')),
  isMessageSender: require(path.normalize(__dirname + '/isMessageSender')),
  conversationCount: require(path.normalize(__dirname + '/conversationCount'))
};

var path = require('path');

module.exports = {
  create: require(path.normalize(__dirname + '/create')),
  messages: require(path.normalize(__dirname + '/messages')),
  getSubject: require(path.normalize(__dirname + '/getSubject')),
  delete: require(path.normalize(__dirname + '/delete')),
  isConversationMember: require(path.normalize(__dirname + '/isConversationMember'))
};

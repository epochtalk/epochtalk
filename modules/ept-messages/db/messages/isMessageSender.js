var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../db'));
var NotFoundError = Promise.OperationalError;
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(messageId, userId) {
  messageId = helper.deslugify(messageId);
  userId = helper.deslugify(userId);

  var q = 'SELECT sender_id FROM private_messages WHERE id = $1';
  return db.sqlQuery(q, [messageId])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { throw new NotFoundError('Message Not Found'); }
  })
  .then(function(message) { return message.sender_id === userId; });
};

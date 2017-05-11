var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

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

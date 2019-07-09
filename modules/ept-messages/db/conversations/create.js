var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../db'));
var using = Promise.using;
var helper = dbc.helper;
var db = dbc.db;
var errors = dbc.errors;
var CreationError = errors.CreationError;

module.exports = function() {
  var conversation = {};
  var q = 'INSERT INTO messages.private_conversations(created_at) VALUES (now()) RETURNING id, created_at';
  return using(db.createTransaction(), function(client) {
    return client.query(q)
    .then(function(results) {
      if (results.rows.length > 0) {
        conversation.id = results.rows[0].id;
        conversation.created_at = results.rows[0].created_at;
      }
      else { throw new CreationError('Private Conversation Could Not Be Saved'); }
    });
  })
  .then(function() { return helper.slugify(conversation); });
};

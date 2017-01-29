var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var NotFoundError = Promise.OperationalError;

module.exports = function(threadId) {
  threadId = helper.deslugify(threadId);
  var q = 'SELECT user_id FROM thread_owners_mapping WHERE thread_id = $1';
  return db.sqlQuery(q, [threadId])
  .then(function(rows) {
    if (rows.length > 0) { return rows; }
    else { throw new NotFoundError('Thread Not Found'); }
  })
  .then(helper.slugify);
};

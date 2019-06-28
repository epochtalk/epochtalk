var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId) {
  threadId = helper.deslugify(threadId);

  var q = 'SELECT EXISTS ( SELECT 1 FROM polls WHERE thread_id = $1 )';
  return db.sqlQuery(q, [threadId])
  .then(function(rows) { return rows[0].exists; });
};

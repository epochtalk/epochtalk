var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId) {
  threadId = helper.deslugify(threadId);
  var increment = 'UPDATE metadata.threads SET views = views + 1 WHERE thread_id = $1';
  return db.sqlQuery(increment, [threadId]);
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId, locked) {
  threadId = helper.deslugify(threadId);
  var lock = 'UPDATE threads SET locked = $1 WHERE id = $2;';
  return db.sqlQuery(lock, [locked, threadId]);
};

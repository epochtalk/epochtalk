var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId, sticky) {
  threadId = helper.deslugify(threadId);
  var stick = 'UPDATE threads SET sticky = $1 WHERE id = $2;';
  return db.sqlQuery(stick, [sticky, threadId]);
};

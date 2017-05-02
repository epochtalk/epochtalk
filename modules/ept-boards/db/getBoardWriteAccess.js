var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(boardId, userPriority) {
  boardId = helper.deslugify(boardId);

  var q = `SELECT postable_by FROM boards WHERE id = $1`;
  return db.sqlQuery(q, [boardId])
  .then(function(rows) {
    if (rows.length > 0 ) { return rows[0].postable_by; }
    else { throw new NotFoundError('Field \'postable_by\' Not Found'); }
  })
  .then(function(postable_by) {
    var postable = false;
    if (postable_by === null || postable_by === undefined) { postable = true; }
    else if (typeof postable_by === 'number' && userPriority <= postable_by) { postable = true; }
    return postable;
  })
  .error(function() { return false; });
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(threadId, userPriority, slug) {
  var q = `SELECT b.postable_by
  FROM boards b
  LEFT JOIN threads t ON t.board_id = b.id
  WHERE `;
  var params;
  if (slug) {
    q += 't.slug = $1';
    params = [slug];
  }
  else {
    threadId = helper.deslugify(threadId);
    q += 't.id = $1';
    params = [threadId];
  }

  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length > 0 ) { return rows[0].postable_by; }
    else { throw new NotFoundError(); }
  })
  .then(function(postable_by) {
    var postable = false;
    if (postable_by === null || postable_by === undefined) { postable = true; }
    else if (typeof postable_by === 'number' && userPriority <= postable_by) { postable = true; }
    return postable;
  })
  .error(function() { return false; });
};

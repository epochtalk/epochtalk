var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');

module.exports = function(userId, opts) {
  var q = 'SELECT user_id FROM users.board_bans WHERE user_id = $1 AND board_id = ';
  var params = [ helper.deslugify(userId) ];
  if (opts.boardId) {
    q += '$2';
    params.push(helper.deslugify(opts.boardId));
  }
  else if (opts.slug) {
    q += '(SELECT t.board_id FROM threads t WHERE t.slug = $2)';
    params.push(opts.slug);
  }
  else if (opts.threadId) {
    q += '(SELECT t.board_id FROM threads t WHERE id = $2)';
    params.push(helper.deslugify(opts.threadId));
  }
  else if (opts.postId) {
    q += '(SELECT t.board_id FROM posts p JOIN threads t ON p.thread_id = t.id WHERE p.id = $2)';
    params.push(helper.deslugify(opts.postId));
  }
  return db.sqlQuery(q, params)
  .then(function(rows) { return rows.length < 1; });
};

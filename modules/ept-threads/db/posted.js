var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  opts = opts || {};
  var userId = helper.deslugify(opts.userId);
  var priority = opts.priority;
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;

  var columns = 'tlist.id, t.locked, t.sticky, t.moderated, t.poll, t.board_name, t.board_id, t.created_at, t.updated_at, t.views as view_count, t.post_count, p.content ->> \'title\' as title, p.user_id, p.username, p.user_deleted, t.time AS last_viewed, tv.id AS post_id, tv.position AS post_position, pl.last_post_id, pl.position AS last_post_position, pl.created_at AS last_post_created_at, pl.deleted AS last_post_deleted, pl.id AS last_post_user_id, pl.username AS last_post_username, pl.user_deleted AS last_post_user_deleted ';
  opts.q2 = 'SELECT t1.locked, t1.sticky, t1.moderated, t1.post_count, t1.created_at, t1.updated_at, mt.views, ' +
  '(SELECT EXISTS ( SELECT 1 FROM polls WHERE thread_id = tlist.id )) as poll, ' +
  '(SELECT time FROM users.thread_views WHERE thread_id = tlist.id AND user_id = $1), ' +
  '(SELECT b.name FROM boards b WHERE b.id = t1.board_id) as board_name, ' +
  '(SELECT b.id FROM boards b WHERE b.id = t1.board_id) as board_id ' +
  'FROM threads t1 ' +
  'LEFT JOIN metadata.threads mt ON tlist.id = mt.thread_id ' +
  'WHERE t1.id = tlist.id';
  opts.q3 = 'SELECT p1.content ->> \'title\' as title, p1.user_id, u.username, u.deleted as user_deleted FROM posts p1 LEFT JOIN users u ON p1.user_id = u.id WHERE p1.thread_id = tlist.id ORDER BY p1.created_at LIMIT 1';
  opts.q4 = 'SELECT id, position FROM posts WHERE thread_id = tlist.id AND created_at >= t.time ORDER BY created_at LIMIT 1';
  opts.q5 = 'SELECT p.id AS last_post_id, p.position, p.created_at, p.deleted, u.id, u.username, u.deleted as user_deleted FROM posts p LEFT JOIN users u ON p.user_id = u.id WHERE p.thread_id = tlist.id ORDER BY p.created_at DESC LIMIT 1';

  // get all related threads
  var query = 'SELECT ' + columns + ' ' +
  'FROM ( ' +
    'SELECT temp.id FROM (' +
      'SELECT DISTINCT (p.thread_id) AS id ' +
      'FROM posts p ' +
      'WHERE p.user_id = $1 ' +
    ') AS temp ' +
    'LEFT JOIN threads t ON temp.id = t.id ' +
    'WHERE EXISTS ( ' +
      'SELECT 1 ' +
      'FROM boards b ' +
      'WHERE b.id = t.board_id ' +
      'AND (b.viewable_by IS NULL OR b.viewable_by >= $2 ) ) ' +
    'AND t.updated_at IS NOT NULL ' +
    'ORDER BY t.updated_at DESC ' +
    'LIMIT $3 OFFSET $4 ' +
  ') tlist ' +
  'LEFT JOIN LATERAL ( ' + opts.q2 + ' ) t ON true ' +
  'LEFT JOIN LATERAL ( ' + opts.q3 + ' ) p ON true ' +
  'LEFT JOIN LATERAL ( ' + opts.q4 + ' ) tv ON true ' +
  'LEFT JOIN LATERAL ( ' + opts.q5 + ' ) pl ON true';
  var params = [userId, priority, limit, offset];
  return db.sqlQuery(query, params)
  .then(function(threads) {
    return Promise.map(threads, function(thread) {
      return common.formatThread(thread, userId); });
  })
  .then(helper.slugify);
};

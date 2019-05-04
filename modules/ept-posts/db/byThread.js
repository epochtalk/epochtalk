var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(threadId, opts) {
  threadId = helper.deslugify(threadId);
  var columns = 'plist.id, plist.position, post.thread_id, post.board_id, post.user_id, post.title, post.body, post.deleted, post.locked, post.right_to_left, post.metadata, post.created_at, post.updated_at, post.imported_at, post.username, post.reported, post.reported_author, post.user_deleted, post.signature, post.avatar, post.post_count, post.name, p2.priority, p2.highlight_color, p2.role_name, (SELECT priority FROM roles WHERE lookup =\'user\') AS default_priority';
  var q2 = 'SELECT p.thread_id, t.board_id, b.right_to_left, p.user_id, p.content ->> \'title\' as title, p.content ->> \'body\' as body, p.metadata, p.deleted, p.locked, p.created_at, p.updated_at, p.imported_at, CASE WHEN EXISTS (SELECT rp.id FROM administration.reports_posts rp WHERE rp.offender_post_id = p.id AND rp.reporter_user_id = $4) THEN \'TRUE\'::boolean ELSE \'FALSE\'::boolean END AS reported, CASE WHEN EXISTS (SELECT ru.id FROM administration.reports_users ru WHERE ru.offender_user_id = p.user_id AND ru.reporter_user_id = $4 AND ru.status = \'Pending\') THEN \'TRUE\'::boolean ELSE \'FALSE\'::boolean END AS reported_author, u.username, u.deleted as user_deleted, up.signature, up.post_count, up.avatar, up.fields->\'name\' as name FROM posts p ' +
    'LEFT JOIN users u ON p.user_id = u.id ' +
    'LEFT JOIN users.profiles up ON u.id = up.user_id ' +
    'LEFT JOIN threads t ON p.thread_id = t.id ' +
    'LEFT JOIN boards b ON t.board_id = b.id ' +
    'WHERE p.id = plist.id';
  var q3 = 'SELECT r.priority, r.highlight_color, r.name as role_name FROM roles_users ru ' +
    'LEFT JOIN roles r ON ru.role_id = r.id ' +
    'WHERE post.user_id = ru.user_id ' +
    'ORDER BY r.priority limit 1';

  opts = opts || {};
  var start = opts.start || 0;
  var limit = opts.limit || 25;
  var userId = opts.userId ? helper.deslugify(opts.userId) : null;
  // get total post count for this thread
  var q = 'SELECT id, position FROM posts WHERE thread_id = $1 AND position > $2 ORDER BY position LIMIT $3';
  var query = 'SELECT ' + columns + ' FROM ( ' +
    q + ' ) plist LEFT JOIN LATERAL ( ' +
    q2 + ' ) post ON true LEFT JOIN LATERAL ( ' +
    q3 + ' ) p2 ON true ORDER BY plist.position';
  var params = [threadId, start, limit, userId];
  return db.sqlQuery(query, params)
  .map(common.formatPost)
  .then(helper.slugify);
};

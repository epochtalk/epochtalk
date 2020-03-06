var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(request) {
  var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
  var q = `SELECT
      p.id, p.position, b.right_to_left, p.content, p.created_at, p.updated_at, p.metadata,
      json_build_object('username', u.username, 'id', p.user_id) AS user,
      json_build_object(
        'id', p.thread_id,
        'locked', t.locked,
        'sticky', t.sticky,
        'moderated', t.moderated,
        'title', (SELECT p2.content->>'title' FROM posts p2 WHERE p2.thread_id = p.thread_id ORDER BY p2.created_at ASC LIMIT 1),
        'started_by', (SELECT u2.username FROM posts p2 LEFT JOIN users u2 ON u2.id = p2.user_id WHERE p2.thread_id = p.thread_id ORDER BY p2.created_at ASC LIMIT 1)
      ) AS thread
    FROM posts p
    LEFT JOIN threads t ON p.thread_id = t.id
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN boards b ON t.board_id = b.id
    WHERE p.user_id IN
      (SELECT user_id FROM roles_users WHERE role_id = (SELECT id FROM roles WHERE lookup = 'newbie'))
      AND p.deleted = FALSE
      AND EXISTS (
          SELECT 1
          FROM boards b2
          WHERE b2.id = t.board_id
          AND ( b2.viewable_by IS NULL OR b2.viewable_by >= $1 )
          AND ( SELECT EXISTS ( SELECT 1 FROM board_mapping WHERE board_id = t.board_id )))
    ORDER BY p.created_at DESC
    LIMIT 200;`;
  return db.sqlQuery(q, [userPriority])
  .map(function(post) {
    // Build the breadcrumbs and reply
    return request.db.breadcrumbs.getBreadcrumbs(helper.slugify(post.thread.id), 'thread', request)
    .then(function(breadcrumbs) {
      post.breadcrumbs = breadcrumbs;
      return post;
    });
  })
  .then(helper.slugify);
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(request) {
  var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
  var q = `
  SELECT
    plist.id,
    post.thread_id,
    post.board_id,
    post.board_name,
    post.user_id,
    post.thread_title,
    post.content,
    post.position,
    post.deleted,
    post.locked,
    post.created_at,
    post.updated_at,
    post.imported_at,
    post.username,
    post.user_deleted,
    post.signature,
    post.avatar,
    post.name,
    p2.priority,
    p2.highlight_color,
    p2.role_name
  FROM (
    SELECT p.id
    FROM posts p
    LEFT JOIN users u on p.user_id = u.id
    LEFT JOIN roles_users ru ON p.user_id = ru.user_id
    LEFT JOIN roles r ON ru.role_id = r.id
    WHERE r.lookup = 'newbie'
    ORDER BY p.created_at DESC
    LIMIT 200
  ) plist
  LEFT JOIN LATERAL (
    SELECT
      p.thread_id,
      t.board_id,
      p.user_id,
      p.content,
      p.position,
      p.deleted,
      p.locked,
      p.created_at,
      p.updated_at,
      p.imported_at,
      b.name as board_name,
      u.username,
      u.deleted as user_deleted,
      up.signature,
      up.avatar,
      up.fields->'name' as name,
      ( SELECT content ->> 'title' as title
        FROM posts
        WHERE thread_id = p.thread_id
        ORDER BY created_at
        LIMIT 1) as thread_title
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN users.profiles up ON u.id = up.user_id
    LEFT JOIN threads t ON p.thread_id = t.id
    LEFT JOIN boards b ON t.board_id = b.id
    WHERE p.id = plist.id
    AND EXISTS (
          SELECT 1
          FROM boards b2
          WHERE b2.id = t.board_id
          AND ( b2.viewable_by IS NULL OR b2.viewable_by >= $1 )
          AND ( SELECT EXISTS ( SELECT 1 FROM board_mapping WHERE board_id = t.board_id )))
  ) post ON true
  LEFT JOIN LATERAL (
    SELECT
      r.priority,
      r.highlight_color,
      r.name as role_name
    FROM roles_users ru
    LEFT JOIN roles r ON ru.role_id = r.id
    WHERE post.user_id = ru.user_id
    ORDER BY priority LIMIT 1
  ) p2 ON true;
  `;
  return db.sqlQuery(q, [userPriority])
  .map(function(post) {
    // Build the breadcrumbs and reply
    return request.db.breadcrumbs.getBreadcrumbs(helper.slugify(post.thread_id), 'thread', request)
    .then(function(breadcrumbs) {
      post.breadcrumbs = breadcrumbs;
      return request.server.methods.common.posts.formatPost(post);
    });
  })
  .then(helper.slugify);
};

var path = require('path');
var common = require(path.normalize(__dirname + '/common'));

var query = `
SELECT
  plist.id,
  post.thread_id,
  post.board_id,
  post.board_name,
  post.user_id,
  post.thread_title,
  post.body,
  post.raw_body,
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
  LIMIT $1 OFFSET $2
) plist
LEFT JOIN LATERAL (
  SELECT
    p.thread_id,
    t.board_id,
    p.user_id,
    p.body,
    p.raw_body,
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
    ( SELECT title
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

function posts(dbc, opts) {
  opts = opts || {};
  opts.limit = opts.limit || 25;
  opts.page = opts.page || 1;
  opts.offset = (opts.page * opts.limit) - opts.limit;

  // get total post count for this thread
  var params = [opts.limit, opts.offset];
  return dbc.db.sqlQuery(query, params)
  .map(common.format)
  .then(dbc.helper.slugify);
}


module.exports = {
  posts: posts
};

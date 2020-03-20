var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Boom = require('boom');

module.exports = function(request, opts) {
  opts = opts || {};
  opts.limit = opts.limit || 25;
  opts.page = opts.page || 1;
  opts.offset = (opts.page * opts.limit) - opts.limit;
  opts.limit = opts.limit + 1;

  var query = `
  SELECT
    plist.id,
    post.thread_id,
    post.board_id,
    post.board_name,
    post.user_id,
    post.thread_title,
    post.body,
    post.metadata,
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
    post.authed_user_is_mod,
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
      p.content ->> \'body\' as body,
      p.metadata,
      p.position,
      p.deleted,
      p.locked,
      p.created_at,
      p.updated_at,
      p.imported_at,
      b.name as board_name,
      CASE WHEN bm.user_id IS NULL THEN FALSE ELSE TRUE END AS authed_user_is_mod,
      u.username,
      u.deleted as user_deleted,
      up.signature,
      up.avatar,
      up.fields->'name' as name,
      ( SELECT content ->> \'title\' as title
        FROM posts
        WHERE thread_id = p.thread_id
        ORDER BY created_at
        LIMIT 1) as thread_title
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN users.profiles up ON u.id = up.user_id
    LEFT JOIN threads t ON p.thread_id = t.id
    LEFT JOIN boards b ON t.board_id = b.id
    LEFT JOIN board_moderators bm ON bm.user_id = $4 AND bm.board_id = t.board_id
    WHERE p.id = plist.id
    AND EXISTS (
          SELECT 1
          FROM boards b2
          WHERE b2.id = t.board_id
          AND ( b2.viewable_by IS NULL OR b2.viewable_by >= $3 )
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

  // get total post count for this thread
  var params = [opts.limit, opts.offset, opts.priority, helper.deslugify(request.auth.credentials.id)];
  return db.sqlQuery(query, params)
  .map(function(post) {
    // Build the breadcrumbs and reply
    return request.db.breadcrumbs.getBreadcrumbs(helper.slugify(post.thread_id), 'thread', request)
    .then(function(breadcrumbs) {
      post.breadcrumbs = breadcrumbs;
      return request.server.methods.common.posts.formatPost(post);
    });
  })
  .then(function(posts) {
    // hasMoreCheck
    var hasMorePosts = false;
    if (posts.length > request.query.limit) {
      hasMorePosts = true;
      posts.pop();
    }

    return {
      limit: request.query.limit,
      page: request.query.page,
      hasMorePosts: hasMorePosts,
      posts: request.server.methods.common.posts.cleanPosts(posts, request.auth.credentials.id, true, request, false, true)
    };
  })
  // handle page or start out of range
  .then(function(ret) {
    var retVal = Boom.notFound();
    if (ret.posts.length > 0 || ret.page === 1) { retVal = ret; }
    return retVal;
  })
  .then(helper.slugify);
}



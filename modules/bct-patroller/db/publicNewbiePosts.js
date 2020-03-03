var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(request) {
  var q = `SELECT
      p.*,
      t.*,
      (SELECT u2.username FROM posts p2 LEFT JOIN users u2 ON u2.id = p2.user_id WHERE p2.thread_id = p.thread_id ORDER BY p2.created_at ASC LIMIT 1) AS thread_started_by_username,
      u.username FROM posts p
    LEFT JOIN threads t ON p.thread_id = t.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.user_id IN
      (SELECT user_id FROM roles_users WHERE role_id = (SELECT id FROM roles WHERE lookup = 'newbie')) AND p.deleted = FALSE
    ORDER BY p.created_at
    LIMIT 200;`;
  return db.sqlQuery(q)
  .map(function(post) {
    // Build the breadcrumbs and reply
    return request.db.breadcrumbs.getBreadcrumbs(helper.slugify(post.thread_id), 'thread', request)
    .then(function(breadcrumbs) {
      post.breadcrumbs = breadcrumbs;
      return post;
    });
  })
  .then(helper.slugify);
};

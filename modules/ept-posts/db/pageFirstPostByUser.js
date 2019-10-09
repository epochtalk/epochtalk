var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(username, priority, opts) {
  // Defaults
  var limit = 25;
  var page = 1;

  if (opts.limit) { limit = opts.limit; }
  else { opts.limit = limit; }
  if (opts.page) { page = opts.page; }
  else { opts.page = page; }

  // Build results object for return
  var results = Object.assign({}, opts);
  results.prev = results.page > 1 ? results.page - 1 : undefined;

  var userq = `SELECT id FROM users WHERE username = $1`;
  return db.sqlQuery(userq, [username])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0].id; }
    else { return Promise.reject('User Not Found'); }
  })
  .then(function(userId) {
    var q = `
      SELECT
        p.id,
        p.thread_id,
        p.user_id,
        p.content ->> 'body' as body,
        p.position,
        p.deleted,
        u.deleted as user_deleted,
        p.created_at,
        p.updated_at,
        p.imported_at,
        b.id as board_id,
        EXISTS (
          SELECT 1
          FROM boards
          WHERE board_id = b.id AND (b.viewable_by >= $2 OR b.viewable_by IS NULL)
        ) as board_visible,
        (
          SELECT p2.content ->> 'title' as title
          FROM posts p2
          WHERE p2.thread_id = p.thread_id
          ORDER BY p2.created_at
          LIMIT 1
        ) as thread_title
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN threads t ON p.thread_id = t.id
    LEFT JOIN boards b ON t.board_id = b.id
    WHERE p.user_id = $1 AND p.position = 1 ORDER BY created_at`;

    var order = opts.desc ? 'DESC' : 'ASC';
    // Calculate pagination vars
    var offset = (page * limit) - limit;
    limit = limit + 1; // query one extra result to see if theres another page


    q = [q, order, 'LIMIT $3 OFFSET $4'].join(' ');
    var params = [userId, priority, limit, offset];
    return db.sqlQuery(q, params)
    .map(common.formatPost)
    .then(function(data) {
      // Check for next page then remove extra record
      if (data.length === limit) {
        results.next = page + 1;
        data.pop();
      }
      results.data = helper.slugify(data);
      return results;
    });
  });
};

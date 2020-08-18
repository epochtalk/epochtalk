var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var querystring = require('querystring');

module.exports = function(opts, priority) {
  opts = opts || {};
  var limit = opts.limit || 25;
  var page = opts.page || 1;

  opts.desc = opts.desc ? 'DESC' : 'ASC';
  opts.search = opts.search || undefined;
  var results = Object.assign({}, opts);
  results.prev = results.page > 1 ? results.page - 1 : undefined;

  var q = `SELECT * FROM
    (SELECT
      p.id,
      ts_headline('simple', (SELECT content ->> 'title' as title from posts WHERE thread_id = p.thread_id ORDER BY created_at LIMIT 1), q, 'StartSel=<mark>, StopSel=</mark>') as thread_title,
      p.user_id,
      p.created_at,
      b.right_to_left,
      u.username,
      p.thread_id,
      (SELECT t.slug FROM threads t WHERE p.thread_id = t.id) as thread_slug,
      p.position,
      ts_headline('simple', p.content ->> 'body', q, 'StartSel=<mark>, StopSel=</mark>, MaxWords=150, HighlightAll=FALSE, MaxFragments=0, FragmentDelimiter=" ... "') as body_match,
      p.content->>'body' as body,
      t.board_id,
      b.name AS board_name
      FROM posts p, users u, threads t, boards b, plainto_tsquery('simple', $1) AS q
      WHERE
        EXISTS (
          SELECT 1
          FROM boards b2
          WHERE b2.id = t.board_id
          AND ( b2.viewable_by IS NULL OR b2.viewable_by >= $2 )
          AND ( SELECT EXISTS ( SELECT 1 FROM board_mapping WHERE board_id = t.board_id ))
        ) AND
        (p.tsv @@ q) AND
        (p.user_id = u.id) AND
        (p.thread_id = t.id) AND
        (t.board_id = b.id)
      LIMIT $3 OFFSET $4) as s
    ORDER BY
      s.created_at DESC`;

  // Calculate pagination vars
  var offset = (page * limit) - limit;
  limit = limit + 1; // query one extra result to see if theres another page

  var params = [querystring.unescape(opts.search), priority, limit, offset];
  if (!opts.search) {
    q = 'SELECT LIMIT 0';
    params = undefined;
  }

  return db.sqlQuery(q, params)
  .then(function(data) {
    // Check for next page then remove extra record
    if (data.length === limit) {
      results.next = page + 1;
      data.pop();
    }
    results.posts = data.map(function(post) {
      post.user = { username: post.username };
      post.body_html = post.body;
      delete post.username;
      return post;
    });
    return results;
  })
  .then(helper.slugify);
};


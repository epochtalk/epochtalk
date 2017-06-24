var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, priority, opts) {
  userId = helper.deslugify(userId);

  opts = opts || {};
  opts.limit = opts.limit || 25;
  opts.page = opts.page || 1;
  opts.offset = (opts.page * opts.limit) - opts.limit;

  var query = `
  SELECT
    tlist.id,
    t.locked,
    t.sticky,
    t.moderated,
    t.poll,
    t.updated_at,
    t.views AS view_count,
    t.board_name,
    t.board_id,
    pf.title,
    tv.id AS new_post_id,
    tv.position AS new_post_position,
    pl.last_post_id,
    pl.position AS last_post_position,
    pl.created_at AS last_post_created_at,
    pl.deleted AS last_post_deleted,
    pl.id AS last_post_user_id,
    pl.username AS last_post_username,
    pl.user_deleted AS last_post_user_deleted
    FROM (
      SELECT t.id
      FROM threads t
      WHERE EXISTS (
        SELECT 1
        FROM boards b
        WHERE b.id = t.board_id
        AND ( b.viewable_by IS NULL OR b.viewable_by >= $2 )
        AND ( SELECT EXISTS ( SELECT 1 FROM board_mapping WHERE board_id = t.board_id ))
      )
      AND t.updated_at IS NOT NULL
      ORDER BY t.updated_at DESC
      LIMIT $3 OFFSET $4
    ) tlist
    LEFT JOIN LATERAL (
      SELECT
        t1.locked,
        t1.sticky,
        t1.moderated,
        t1.updated_at,
        mt.views,
        ( SELECT EXISTS ( SELECT 1 FROM polls WHERE thread_id = tlist.id )) AS poll,
        ( SELECT time FROM users.thread_views WHERE thread_id = tlist.id AND user_id = $1 ) AS time,
        ( SELECT b.name FROM boards b WHERE b.id = t1.board_id ) AS board_name,
        ( SELECT b.id FROM boards b WHERE b.id = t1.board_id ) AS board_id
      FROM threads t1
      LEFT JOIN metadata.threads mt ON tlist.id = mt.thread_id
      WHERE t1.id = tlist.id
    ) t ON true
    LEFT JOIN LATERAL (
      SELECT content ->> 'title' as title
      FROM posts
      WHERE thread_id = tlist.id
      ORDER BY created_at
      LIMIT 1
    ) pf ON true
    LEFT JOIN LATERAL (
      SELECT id, position
      FROM posts
      WHERE thread_id = tlist.id
      AND created_at >= t.time
      ORDER BY created_at
      LIMIT 1
    ) tv ON true
    LEFT JOIN LATERAL (
      SELECT
        p.id AS last_post_id,
        p.position,
        p.created_at,
        p.deleted,
        u.id,
        u.username,
        u.deleted as user_deleted
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.thread_id = tlist.id
      ORDER BY p.created_at DESC
      LIMIT 1
    ) pl ON true
  `;
  var params = [userId, priority, opts.limit, opts.offset];

  return db.sqlQuery(query, params)
  .then(function(threads) {
    return Promise.map(threads, function(thread) { return formatThread(thread); });
  })
  .then(helper.slugify);
};

var formatThread = function(thread) {
  // handle board
  thread.board = { id: thread.board_id, name: thread.board_name };
  delete thread.board_name;
  delete thread.board_id;

  // handle Posts
  thread.post = {
    id: thread.last_post_id,
    position: thread.last_post_position,
    created_at: thread.last_post_created_at,
    deleted: thread.last_post_deleted
  };
  delete thread.last_post_id;
  delete thread.last_post_position;
  delete thread.last_post_created_at;
  delete thread.last_post_deleted;

  // handle latest
  if (thread.new_post_id || thread.new_post_position) {
    thread.latest = { id: thread.new_post_id, position: thread.new_post_position || 1 };
  }
  delete thread.new_post_id;
  delete thread.new_post_position;

  // handle User
  thread.user = {
    id: thread.last_post_user_id,
    username: thread.last_post_username,
    deleted: thread.last_post_user_deleted
  };
  delete thread.last_post_user_id;
  delete thread.last_post_username;
  delete thread.last_post_user_deleted;

  // handle deleted
  if (thread.user.deleted || thread.post.deleted) {
    thread.deleted = true;
    thread.user.id = '';
    thread.user.username = '';
  }

  return thread;
};

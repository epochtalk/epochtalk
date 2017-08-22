var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId, opts) {
  userId = helper.deslugify(userId);

  opts = opts || {};
  opts.limit = opts.limit || 25;
  opts.page = opts.page || 1;
  opts.offset = (opts.page * opts.limit) - opts.limit;
  opts.limit += 1; // hasMoreThreads check
  opts.limit = opts.limit + opts.offset;

  return unreadThreads(userId, opts)
  .then(function(threads) {
    return Promise.map(threads, function(thread) {
      return formatThread(thread, userId); // format thead output
    });
  })
  .then(helper.slugify);
};

function unreadThreads(userId, opts) {
  var q = 'SELECT tlist.id, t.locked, t.sticky, t.created_at, t.updated_at, t.views as view_count, t.post_count, p.title, p.user_id, p.username, p.user_deleted, t.time AS last_viewed, tv.id AS post_id, tv.position AS post_position, pl.last_post_id, pl.position AS last_post_position, pl.created_at AS last_post_created_at, pl.deleted AS last_post_deleted, pl.id AS last_post_user_id, pl.username AS last_post_username, pl.user_deleted AS last_post_user_deleted ';
  q += 'FROM ( ';
  q +=   'SELECT z.id FROM ( ';
  q +=     'SELECT id, updated_at FROM ( ';
  q +=       'SELECT t.id, t.updated_at ';
  q +=       'FROM users.watch_threads wt ';
  q +=       'LEFT JOIN users.thread_views tv ';
  q +=       'ON wt.thread_id = tv.thread_id AND wt.user_id = tv.user_id ';
  q +=       'LEFT JOIN threads t ON wt.thread_id = t.id ';
  q +=       'WHERE wt.user_id = $1 ';
  q +=       'AND t.updated_at IS NOT NULL ';
  q +=       'AND (t.updated_at >= tv.time OR tv.time IS NULL) ';
  q +=       'ORDER BY updated_at DESC LIMIT $2 ';
  q +=     ') t ';
  q +=     'UNION ';
  q +=     'SELECT i.id, i.updated_at FROM ( ';
  q +=       'SELECT board_id ';
  q +=       'FROM users.watch_boards ';
  q +=       'WHERE user_id = $1 ';
  q +=     ') b JOIN LATERAL ( ';
  q +=       'SELECT id, updated_at ';
  q +=       'FROM threads t ';
  q +=       'LEFT JOIN users.thread_views tv ON t.id = tv.thread_id AND tv.user_id = $1 ';
  q +=       'WHERE t.board_id = b.board_id ';
  q +=       'AND t.updated_at IS NOT NULL ';
  q +=       'AND (t.updated_at >= tv.time OR tv.time IS NULL) ';
  q +=       'ORDER BY updated_at DESC LIMIT $2 ';
  q +=     ') i ON true ';
  q +=   ') z ';
  q +=   'ORDER BY updated_at DESC LIMIT $2 OFFSET $3 ';
  q += ') tlist LEFT JOIN LATERAL ( ';
  q +=   'SELECT t1.locked, t1.sticky, t1.post_count, t1.created_at, t1.updated_at, mt.views, ';
  q +=   '(SELECT time FROM users.thread_views WHERE thread_id = tlist.id AND user_id = $1) ';
  q +=   'FROM threads t1 LEFT JOIN metadata.threads mt ON tlist.id = mt.thread_id ';
  q +=   'WHERE t1.id = tlist.id ';
  q += ') t ON true LEFT JOIN LATERAL ( ';
  q +=   'SELECT p1.content ->> \'title\' as title, p1.user_id, u.username, u.deleted as user_deleted ';
  q +=   'FROM posts p1 LEFT JOIN users u ON p1.user_id = u.id ';
  q +=   'WHERE p1.thread_id = tlist.id ORDER BY p1.created_at LIMIT 1';
  q += ') p ON true LEFT JOIN LATERAL ( ';
  q +=   'SELECT id, position ';
  q +=   'FROM posts ';
  q +=   'WHERE thread_id = tlist.id AND created_at >= t.time ';
  q +=   'ORDER BY created_at LIMIT 1 ';
  q += ') tv ON true LEFT JOIN LATERAL ( ';
  q +=   'SELECT p.id AS last_post_id, p.position, p.created_at, p.deleted, u.id, u.username, ';
  q +=   'u.deleted as user_deleted ';
  q +=   'FROM posts p LEFT JOIN users u ON p.user_id = u.id ';
  q +=   'WHERE p.thread_id = tlist.id ';
  q +=   'ORDER BY p.created_at DESC LIMIT 1 ';
  q += ') pl ON true';
  return db.sqlQuery(q, [userId, opts.limit, opts.offset]);
}

function formatThread(thread, userId) {
  // handle deleted user
  if (thread.user_deleted) {
    thread.user_id = '';
    thread.username = '';
  }

  // format user output
  thread.user = {
    id: thread.user_id,
    username: thread.username,
    deleted: thread.user_deleted
  };
  delete thread.user_id;
  delete thread.username;
  delete thread.user_deleted;

  // format last
  if (userId && !thread.last_viewed) {
    thread.has_new_post = true;
    thread.latest_unread_position = 1;
  }
  else if (userId && userId !== thread.last_post_user_id && thread.last_viewed <= thread.last_post_created_at) {
    thread.has_new_post = true;
    thread.latest_unread_position = thread.post_position;
    thread.latest_unread_post_id = thread.post_id;
  }
  delete thread.post_id;
  delete thread.post_position;
  delete thread.last_viewed;

  // handle last post formatting
  if (thread.last_post_deleted || thread.last_post_user_deleted) {
    thread.last_deleted = true;
    delete thread.last_post_username;
  }
  delete thread.last_post_deleted;
  delete thread.last_post_user_deleted;
  delete thread.last_post_user_id;
  return thread;
}

var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(boardId, userId, opts) {
  boardId = helper.deslugify(boardId);
  userId = helper.deslugify(userId || undefined);

  opts = opts || {};
  opts.limit = opts.limit || 25;
  opts.page = opts.page || 1;
  opts.offset = (opts.page * opts.limit) - opts.limit;
  opts.reversed = 'DESC';
  opts.columns = `
    tlist.id,
    t.locked,
    t.sticky,
    t.moderated,
    t.poll,
    t.created_at,
    t.updated_at,
    t.views as view_count,
    t.post_count,
    p.title,
    p.user_id,
    p.username,
    p.user_deleted,
    t.time AS last_viewed,
    tv.id AS post_id,
    tv.position AS post_position,
    pl.last_post_id,
    pl.position AS last_post_position,
    pl.created_at AS last_post_created_at,
    pl.updated_at AS last_post_updated_at,
    pl.body as post_body,
    pl.avatar as post_avatar,
    pl.signature as post_signature,
    pl.name as post_user_name,
    pl.highlight_color as post_highlight_color,
    pl.role_name as post_role_name,
    pl.deleted AS last_post_deleted,
    pl.id AS last_post_user_id,
    pl.username AS last_post_username,
    pl.user_deleted AS last_post_user_deleted `;
  opts.q2 = `
    SELECT
      t1.locked,
      t1.sticky,
      t1.moderated,
      t1.post_count,
      t1.created_at,
      t1.updated_at,
      mt.views,
      (SELECT EXISTS ( SELECT 1 FROM polls WHERE thread_id = tlist.id )) as poll,
      (SELECT time FROM users.thread_views WHERE thread_id = tlist.id AND user_id = $2)
      FROM threads t1
      LEFT JOIN metadata.threads mt ON tlist.id = mt.thread_id
      WHERE t1.id = tlist.id`;
  opts.q3 = `
    SELECT
      p1.content->>\'title\' as title,
      p1.user_id,
      u.username,
      u.deleted as user_deleted
    FROM posts p1
    LEFT JOIN users u ON p1.user_id = u.id
    WHERE p1.thread_id = tlist.id
    ORDER BY p1.created_at
    LIMIT 1`;
  opts.q4 = `
    SELECT
      id,
      position
    FROM posts
    WHERE thread_id = tlist.id
    AND created_at >= t.time
    ORDER BY created_at
    LIMIT 1`;
  opts.q5 = `
    SELECT
      p.id AS last_post_id,
      p.position,
      p.created_at,
      p.updated_at,
      p.content ->>\'body\' as body,
      p.deleted,
      u.id,
      u.username,
      u.deleted as user_deleted,
      up.avatar,
      up.signature,
      up.fields->\'name\' as name,
      (
        SELECT r.highlight_color
        FROM roles_users ru
        LEFT JOIN roles r ON ru.role_id = r.id
        WHERE u.id = ru.user_id
        ORDER BY r.priority LIMIT 1
      ) as highlight_color,
      (
        SELECT r.name
        FROM roles_users ru
        LEFT JOIN roles r ON ru.role_id = r.id
        WHERE u.id = ru.user_id
        ORDER BY r.priority LIMIT 1
      ) as role_name
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFt JOIn users.profiles up ON p.user_id = up.user_id
    WHERE p.thread_id = tlist.id
    ORDER BY p.created_at DESC
    LIMIT 1`;

  return getNormalThreads(boardId, userId, opts)
  .then(helper.slugify);
};

var getNormalThreads = function(boardId, userId, opts) {
  var getBoardSQL = 'SELECT thread_count FROM boards WHERE id = $1';
  return db.scalar(getBoardSQL, [boardId])
  .then(function(result) {
    if (result) {
      // determine whether to start from the front or back
      var threadCount = result.thread_count;
      if (opts.offset > Math.floor(threadCount / 2)) {
        opts.reversed = '';
        opts.limit = threadCount <= opts.offset + opts.limit ? threadCount - opts.offset : opts.limit;
        opts.offset = threadCount <= opts.offset + opts.limit ? 0 : threadCount - opts.offset - opts.limit;
      }
    }
  })
  // get all related threads
  .then(function() {
    var query = 'SELECT ' + opts.columns + ' FROM ( ' +
      'SELECT id ' +
      'FROM threads ' +
      'WHERE board_id = $1 AND updated_at IS NOT NULL ' +
      'ORDER BY updated_at ' + opts.reversed + ' ' +
      'LIMIT $3 OFFSET $4 ' +
    ') tlist ' +
    'LEFT JOIN LATERAL ( ' + opts.q2 + ' ) t ON true ' +
    'LEFT JOIN LATERAL ( ' + opts.q3 + ' ) p ON true ' +
    'LEFT JOIN LATERAL ( ' + opts.q4 + ' ) tv ON true ' +
    'LEFT JOIN LATERAL ( ' + opts.q5 + ' ) pl ON true';
    var params = [boardId, userId, opts.limit, opts.offset];
    return db.sqlQuery(query, params);
  })
  .then(function(threads) {
    // reverse ordering if backward search
    if (!opts.reversed) { threads.reverse(); }
    // rearrange last post and user properties
    return Promise.map(threads, function(thread) {
      return common.formatThread(thread, userId);
    });
  });
};

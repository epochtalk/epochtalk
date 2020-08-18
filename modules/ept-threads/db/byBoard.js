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
  opts.sortField = opts.sortField || 'updated_at';
  opts.reversed = opts.desc ? 'DESC' : '';
  opts.sortOrder = opts.reversed;
  opts.columns = 'tlist.id, t.locked, t.sticky, t.slug, t.moderated, t.poll, t.created_at, t.updated_at, tlist.views AS view_count, t.post_count, p.title, p.user_id, p.username, p.user_deleted, t.time AS last_viewed, tv.id AS post_id, tv.position AS post_position, pl.last_post_id, pl.position AS last_post_position, pl.created_at AS last_post_created_at, pl.deleted AS last_post_deleted, pl.id AS last_post_user_id, pl.username AS last_post_username, pl.user_deleted AS last_post_user_deleted, pl.avatar AS last_post_avatar';
  opts.q2 = 'SELECT t1.locked, t1.sticky, t1.slug, t1.moderated, t1.post_count, t1.created_at, t1.updated_at, mt.views, ' +
    '(SELECT EXISTS ( SELECT 1 FROM polls WHERE thread_id = tlist.id )) as poll, ' +
    '(SELECT time FROM users.thread_views WHERE thread_id = tlist.id AND user_id = $2) ' +
    'FROM threads t1 ' +
    'LEFT JOIN metadata.threads mt ON tlist.id = mt.thread_id ' +
    'WHERE t1.id = tlist.id';
  opts.q3 = 'SELECT p1.content ->> \'title\' as title, p1.user_id, u.username, u.deleted as user_deleted FROM posts p1 LEFT JOIN users u ON p1.user_id = u.id WHERE p1.thread_id = tlist.id ORDER BY p1.created_at LIMIT 1';
  opts.q4 = 'SELECT id, position FROM posts WHERE thread_id = tlist.id AND created_at >= t.time ORDER BY created_at LIMIT 1';
  opts.q5 = 'SELECT p.id AS last_post_id, p.position, p.created_at, p.deleted, u.id, u.username, u.deleted as user_deleted, up.avatar FROM posts p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN users.profiles up ON p.user_id = up.user_id WHERE p.thread_id = tlist.id ORDER BY p.created_at DESC LIMIT 1';

  var stickyThreads = getStickyThreads(boardId, userId, opts);
  var normalThreads = getNormalThreads(boardId, userId, opts);

  return Promise.join(stickyThreads, normalThreads, function(sticky, normal) {
    return { normal: normal, sticky: sticky };
  })
  .then(helper.slugify);
};

var getNormalThreads = function(boardId, userId, opts) {
  var innerSortField;
  if (opts.sortField === 'views') { innerSortField = 'mt.views'; }
  else { innerSortField = 't2.' + opts.sortField; }

  var getBoardSQL = 'SELECT thread_count FROM boards WHERE id = $1';
  var stickyThreadCountSQL = 'SELECT COUNT(*) FROM threads WHERE board_id = $1 AND sticky = True;';
  return Promise.join(db.scalar(getBoardSQL, [boardId]), db.scalar(stickyThreadCountSQL, [boardId]))
  .then(function(result) {
    var threadCountResult = result[0];
    var stickyThreadCountResult = result[1];
    if (threadCountResult) {
      // determine whether to start from the front or back
      var threadCount = threadCountResult.thread_count;
      if (stickyThreadCountResult) {
        threadCount = threadCount - stickyThreadCountResult.count;
      }
      if (opts.offset > Math.floor(threadCount / 2)) {
        opts.reversed = opts.reversed === '' ? 'DESC' : '';
        opts.limit = threadCount <= opts.offset + opts.limit ? threadCount - opts.offset : opts.limit;
        opts.offset = threadCount <= opts.offset + opts.limit ? 0 : threadCount - opts.offset - opts.limit;
      }
    }
  })
  // get all related threads
  .then(function() {
    var query = 'SELECT ' + opts.columns + ' FROM ( ' +
      'SELECT t2.id, t2.updated_at, mt.views, t2.created_at, t2.post_count ' +
      'FROM threads t2 ' +
      'LEFT JOIN metadata.threads mt ON t2.id = mt.thread_id ' +
      'WHERE t2.board_id = $1 AND t2.sticky = False AND t2.updated_at IS NOT NULL ' +
      'ORDER BY ' + innerSortField + ' ' + opts.reversed + ' ' +
      'LIMIT $3 OFFSET $4 ' +
    ') tlist ' +
    'LEFT JOIN LATERAL ( ' + opts.q2 + ' ) t ON true ' +
    'LEFT JOIN LATERAL ( ' + opts.q3 + ' ) p ON true ' +
    'LEFT JOIN LATERAL ( ' + opts.q4 + ' ) tv ON true ' +
    'LEFT JOIN LATERAL ( ' + opts.q5 + ' ) pl ON true ' +
    'ORDER BY tlist.' + opts.sortField + ' ' + opts.sortOrder;
    var params = [boardId, userId, opts.limit, opts.offset];
    return db.sqlQuery(query, params);
  })
  .then(function(threads) {
    // rearrange last post and user properties
    return Promise.map(threads, function(thread) {
      return common.formatThread(thread, userId);
    });
  });
};

var getStickyThreads = function(boardId, userId, opts) {
  if (opts.page !== 1) { return []; }
  var innerSortField;
  if (opts.sortField === 'views') { innerSortField = 'mt.views'; }
  else { innerSortField = 't2.' + opts.sortField; }
  var query = 'SELECT ' + opts.columns + ' FROM ( ' +
    'SELECT t2.id, t2.updated_at, mt.views, t2.created_at, t2.post_count ' +
    'FROM threads t2 ' +
    'LEFT JOIN metadata.threads mt ON t2.id = mt.thread_id ' +
    'WHERE t2.board_id = $1 AND t2.sticky = True AND t2.updated_at IS NOT NULL ' +
    'ORDER BY ' + innerSortField + ' ' + opts.reversed + ' ' +
  ') tlist ' +
  'LEFT JOIN LATERAL ( ' + opts.q2 + ' ) t ON true ' +
  'LEFT JOIN LATERAL ( ' + opts.q3 + ' ) p ON true ' +
  'LEFT JOIN LATERAL ( ' + opts.q4 + ' ) tv ON true ' +
  'LEFT JOIN LATERAL ( ' + opts.q5 + ' ) pl ON true ' +
  'ORDER BY tlist.' + opts.sortField + ' ' + opts.sortOrder;
  return db.sqlQuery(query, [boardId, userId])
  .map(function(thread) { return common.formatThread(thread, userId); });
};

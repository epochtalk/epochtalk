var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  var q = 'SELECT rp.id, rp.status, rp.reporter_user_id, rp.reporter_reason, rp.reviewer_user_id, rp.offender_post_id, rp.created_at, rp.updated_at, (SELECT username FROM users WHERE rp.reporter_user_id = id) as reporter_username, (SELECT board_id FROM threads t WHERE p.thread_id = t.id), (SELECT slug FROM threads t WHERE p.thread_id = t.id) as offender_thread_slug, (SELECT EXISTS (SELECT fp.id FROM (SELECT id FROM posts WHERE thread_id = p.thread_id ORDER BY created_at LIMIT 1) as fp WHERE id = p.id)::boolean as offender_thread_starter), p.created_at as offender_created_at, p.content->>\'title\' as offender_title, p.thread_id as offender_thread_id, o.username as offender_author_username, o.id as offender_author_id, o.email as offender_author_email, o.created_at as offender_author_created_at, b.expiration as offender_ban_expiration, (SELECT EXISTS (SELECT true FROM users.board_bans WHERE user_id = o.id)) as offender_board_banned FROM administration.reports_posts rp JOIN posts p ON(rp.offender_post_id = p.id) JOIN users o ON(p.user_id = o.id) LEFT JOIN (SELECT ub.expiration, ub.user_id FROM users.bans ub WHERE ub.expiration > now()) b ON (o.id = b.user_id)';
  var limit = 10;
  var page = 1;
  var sortField = 'created_at';
  var order = 'ASC';
  var params;
  if (opts && opts.limit) { limit = opts.limit; }
  if (opts && opts.page) { page = opts.page; }
  if (opts && opts.sortField) { sortField = opts.sortField; }
  if (opts && opts.desc) { order = 'DESC'; }
  var offset = (page * limit) - limit;
  if (opts && opts.modId) { opts.modId = helper.deslugify(opts.modId); } // deslugify modId
  if (opts && opts.filter && opts.searchStr && opts.modId) { // filter + search + moderated boards
    q = [q, 'WHERE rp.status = $1 AND o.username LIKE $2 AND (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $3) ORDER BY', sortField, order, 'LIMIT $4 OFFSET $5'].join(' ');
    params = [opts.filter, opts.searchStr + '%', opts.modId, limit, offset];
  }
  else if (opts && opts.filter && opts.searchStr && !opts.modId) { // filter + search
    q = [q, 'WHERE rp.status = $1 AND o.username LIKE $2 ORDER BY', sortField, order, 'LIMIT $3 OFFSET $4'].join(' ');
    params = [opts.filter, opts.searchStr + '%', limit, offset];
  }
  else if (opts && opts.filter && !opts.searchStr && opts.modId) { // filter + moderated boards
    q = [q, 'WHERE rp.status = $1 AND (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $2) ORDER BY', sortField, order, 'LIMIT $3 OFFSET $4'].join(' ');
    params = [opts.filter, opts.modId, limit, offset];
  }
  else if (opts && !opts.filter && opts.searchStr && opts.modId) { // search + moderated boards
    q = [q, 'WHERE o.username LIKE $1 AND (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $2) ORDER BY', sortField, order, 'LIMIT $3 OFFSET $4'].join(' ');
    params = [opts.searchStr + '%', opts.modId, limit, offset];
  }
  else if (opts && opts.filter && !opts.searchStr) { // filter only
    q = [q, 'WHERE rp.status = $1 ORDER BY', sortField, order, 'LIMIT $2 OFFSET $3'].join(' ');
    params = [opts.filter, limit, offset];
  }
  else if (opts && !opts.filter && opts.searchStr) { // search only
    q = [q, 'WHERE o.username LIKE $1 ORDER BY', sortField, order, 'LIMIT $2 OFFSET $3'].join(' ');
    params = [opts.searchStr + '%', limit, offset];
  }
  else if (opts && !opts.filter && !opts.searchStr && opts.modId) { // moderated boards only
    q = [q, 'WHERE (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $1) ORDER BY', sortField, order, 'LIMIT $2 OFFSET $3'].join(' ');
    params = [opts.modId, limit, offset];
  }
  else { // no filter or search or moderated boards
    q = [q, 'ORDER BY', sortField, order, 'LIMIT $1 OFFSET $2'].join(' ');
    params = [limit, offset];
  }
  return db.sqlQuery(q, params)
  .then(helper.slugify);
};

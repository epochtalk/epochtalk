var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  var q = 'SELECT rm.id, rs.status, rm.reporter_user_id, rm.reporter_reason, rm.reviewer_user_id, rm.offender_message_id, rm.created_at, rm.updated_at, (SELECT username FROM users WHERE rm.reporter_user_id = id) as reporter_username, pm.created_at as offender_created_at, pm.body as offender_message, o.username as offender_author_username, o.id as offender_author_id, o.email as offender_author_email, o.created_at as offender_author_created_at, b.expiration as offender_ban_expiration, (SELECT EXISTS (SELECT true FROM users.board_bans WHERE user_id = o.id)) as offender_board_banned FROM administration.reports_messages rm JOIN administration.reports_statuses rs ON(rm.status_id = rs.id) JOIN private_messages pm ON(rm.offender_message_id = pm.id) JOIN users o ON(pm.sender_id = o.id) LEFT JOIN (SELECT ub.expiration, ub.user_id FROM users.bans ub WHERE ub.expiration > now()) b ON (o.id = b.user_id)';
  var limit = 10;
  var page = 1;
  var sortField = 'created_at';
  var order = 'ASC';
  var params;
  if (opts && opts.limit) { limit = opts.limit; }
  if (opts && opts.page) { page = opts.page; }
  if (opts && opts.sortField) { sortField = opts.sortField; }
  if (opts && opts.sortDesc) { order = 'DESC'; }
  var offset = (page * limit) - limit;
  if (opts && opts.filter && opts.searchStr) { // filter + search
    q = [q, 'WHERE rs.status = $1 AND o.username LIKE $2 ORDER BY', sortField, order, 'LIMIT $3 OFFSET $4'].join(' ');
    params = [opts.filter, opts.searchStr + '%', limit, offset];
  }
  else if (opts && opts.filter && !opts.searchStr) { // filter only
    q = [q, 'WHERE rs.status = $1 ORDER BY', sortField, order, 'LIMIT $2 OFFSET $3'].join(' ');
    params = [opts.filter, limit, offset];
  }
  else if (opts && !opts.filter && opts.searchStr) { // search only
    q = [q, 'WHERE o.username LIKE $1 ORDER BY', sortField, order, 'LIMIT $2 OFFSET $3'].join(' ');
    params = [opts.searchStr + '%', limit, offset];
  }
  else { // no filter or search
    q = [q, 'ORDER BY', sortField, order, 'LIMIT $1 OFFSET $2'].join(' ');
    params = [limit, offset];
  }
  return db.sqlQuery(q, params)
  .then(helper.slugify);
};

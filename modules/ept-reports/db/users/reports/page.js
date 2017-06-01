var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  var q = 'SELECT ru.id, rs.status, ru.reporter_user_id, ru.reporter_reason, ru.reviewer_user_id, ru.offender_user_id, ru.created_at, ru.updated_at, (SELECT username FROM users WHERE ru.reporter_user_id = id) as reporter_username, o.username as offender_username, o.email as offender_email, o.created_at as offender_created_at, b.expiration as offender_ban_expiration, (SELECT EXISTS (SELECT true FROM users.board_bans WHERE user_id = o.id)) as offender_board_banned FROM administration.reports_users ru JOIN administration.reports_statuses rs ON(ru.status_id = rs.id) JOIN users o ON(ru.offender_user_id = o.id) LEFT JOIN (SELECT ub.expiration, ub.user_id FROM users.bans ub WHERE ub.expiration > now()) b ON (o.id = b.user_id)';
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

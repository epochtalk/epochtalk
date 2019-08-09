var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  var q = 'SELECT count(rp.id) FROM administration.reports_posts rp';
  var params;
  if (opts && opts.modId) { opts.modId = helper.deslugify(opts.modId); } // deslugify modId
  if (opts && opts.filter && opts.searchStr && opts.modId) { // filter + search + moderated boards
    q += ' JOIN posts p ON(rp.offender_post_id = p.id) JOIN users o ON(p.user_id = o.id) WHERE rp.status = $1 AND o.username LIKE $2 AND (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $3)';
    params = [opts.filter, opts.searchStr + '%', opts.modId];
  }
  else if (opts && opts.filter && opts.searchStr && !opts.modId) { // filter + search
    q += ' JOIN posts p ON(rp.offender_post_id = p.id) JOIN users o ON(p.user_id = o.id) WHERE rp.status = $1 AND o.username LIKE $2';
    params = [opts.filter, opts.searchStr + '%'];
  }
  else if (opts && opts.filter && !opts.searchStr && opts.modId) { // filter + moderated boards
    q += ' JOIN posts p ON(rp.offender_post_id = p.id) WHERE rp.status = $1 AND (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $2)';
    params = [opts.filter, opts.modId];
  }
  else if (opts && !opts.filter && opts.searchStr && opts.modId) { // search + moderated boards
    q += ' JOIN posts p ON(rp.offender_post_id = p.id) JOIN users o ON(p.user_id = o.id) WHERE o.username LIKE $1 AND (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $2)';
    params = [opts.searchStr + '%', opts.modId];
  }
  else if (opts && !opts.filter && !opts.searchStr && opts.modId) { // moderated boards only
    q += ' JOIN posts p ON(rp.offender_post_id = p.id) WHERE (SELECT board_id FROM threads t WHERE p.thread_id = t.id) IN (SELECT board_id FROM board_moderators WHERE user_id = $1)';
    params = [opts.modId];
  }
  else if (opts && opts.filter && !opts.searchStr && !opts.modId) { // filter only
    q += ' WHERE rp.status = $1';
    params = [opts.filter];
  }
  else if (opts && !opts.filter && opts.searchStr && !opts.modId) { // search only
    q += ' JOIN posts p ON(rp.offender_post_id = p.id) JOIN users o ON(p.user_id = o.id) WHERE o.username LIKE $1';
    params = [opts.searchStr + '%'];
  }
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length) { return Number(rows[0].count); }
    else { return 0; }
  });
};

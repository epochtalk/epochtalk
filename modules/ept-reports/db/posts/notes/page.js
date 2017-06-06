var path = require('path');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(reportId, opts) {
  reportId = helper.deslugify(reportId);
  var q = 'SELECT n.id, n.report_id, n.user_id, n.note, n.created_at, n.updated_at, (SELECT u.username FROM users u WHERE u.id = n.user_id), (SELECT p.avatar FROM users.profiles p WHERE p.user_id = n.user_id) FROM administration.reports_posts_notes n WHERE n.report_id = $1 ORDER BY n.created_at';
  var limit = 10;
  var page = 1;
  var order = 'ASC';
  if (opts && opts.limit) { limit = opts.limit; }
  if (opts && opts.page) { page = opts.page; }
  if (opts && opts.desc) { order = 'DESC'; }
  q = [q, order, 'LIMIT $2 OFFSET $3'].join(' ');
  var offset = (page * limit) - limit;
  var params = [reportId, limit, offset];
  return db.sqlQuery(q, params)
  .then(helper.slugify);
};

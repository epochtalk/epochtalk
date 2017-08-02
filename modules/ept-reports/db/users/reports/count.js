var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;

module.exports = function(opts) {
  var q = 'SELECT count(ru.id) FROM administration.reports_users ru'; // no status or search
  var params;
  if (opts && opts.filter && opts.searchStr) { // status + search
    q += ' JOIN users u ON(ru.offender_user_id = u.id) WHERE ru.status = $1 AND u.username LIKE $2';
    params = [opts.filter, opts.searchStr + '%'];
  }
  else if (opts && opts.filter && !opts.searchStr) { // status only
    q += ' WHERE ru.status = $1';
    params = [opts.filter];
  }
  else if (opts && !opts.filter && opts.searchStr) { // search only
    q += ' JOIN users u ON(ru.offender_user_id = u.id) WHERE u.username LIKE $1';
    params = [opts.searchStr + '%'];
  }

  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length) { return Number(rows[0].count); }
    else { return Promise.reject(); }
  });
};

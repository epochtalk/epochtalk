var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/../../db'));
var db = dbc.db;

module.exports = function(opts) {
  var q = 'SELECT count(rm.id) FROM administration.reports_messages rm';
  var params;
  if (opts && opts.filter && opts.searchStr) { // filter + search
    q += ' JOIN messages.private_messages pm ON(rm.offender_message_id = pm.id) JOIN users o ON(pm.sender_id = o.id) WHERE rm.status = $1 AND o.username LIKE $2';
    params = [opts.filter, opts.searchStr + '%'];
  }
  else if (opts && opts.filter && !opts.searchStr) { // filter only
    q += ' WHERE rm.status = $1';
    params = [opts.filter];
  }
  else if (opts && !opts.filter && opts.searchStr) { // search only
    q += ' JOIN messages.private_messages pm ON(rm.offender_message_id = pm.id) JOIN users o ON(pm.sender_id = o.id) WHERE o.username LIKE $1';
    params = [opts.searchStr + '%'];
  }
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length) { return Number(rows[0].count); }
    else { return Promise.reject(); }
  });
};

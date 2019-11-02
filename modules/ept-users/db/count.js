var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

/* returns total user count */
module.exports = function(opts) {
  var q = 'SELECT count(*) FROM users u';
  var params;
  if (opts && opts.ip && opts.searchStr) {
    if (opts && opts.filter && opts.filter === 'banned') {
      q += ' RIGHT JOIN users.bans b ON (u.id = b.user_id AND b.expiration > now())';
    }
    if (opts && opts.searchStr) {
      q += ' INNER JOIN (SELECT DISTINCT i.user_id FROM users.ips i WHERE i.user_ip LIKE $1) as ip ON (ip.user_id = u.id)';
      params = [opts.searchStr];
    }
  }
  else {
    if (opts && opts.filter && opts.filter === 'banned') {
      q += ' RIGHT JOIN users.bans b ON (u.id = b.user_id AND b.expiration > now())';
    }
    if (opts && opts.searchStr) {
      q += ' WHERE u.username LIKE $1';
      params = ['%' + opts.searchStr + '%'];
    }
  }
  return db.sqlQuery(q, params)
  .then(function(rows) {
    if (rows.length) { return { count: Number(rows[0].count) }; }
    else { return 0; }
  });
};

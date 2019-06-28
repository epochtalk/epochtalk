var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(addrInfo) {
  var hostname = addrInfo.hostname;
  var ip = addrInfo.ip ? addrInfo.ip.split('.') : undefined;
  var q, params;
  if (hostname) {
    q = 'DELETE FROM banned_addresses WHERE hostname = $1 RETURNING hostname, weight, decay, created_at, updates';
    params = [ hostname ];
  }
  else {
    q = 'DELETE FROM banned_addresses WHERE ip1 = $1 AND ip2 = $2 AND ip3 = $3 AND ip4 = $4 RETURNING ip1, ip2, ip3, ip4, weight, decay, created_at, updates';
    params = [ ip[0], ip[1], ip[2], ip[3] ];
  }
  return db.scalar(q, params);
};

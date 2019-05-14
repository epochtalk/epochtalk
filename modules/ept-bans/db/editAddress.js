var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(addrInfo) {
  var hostname = addrInfo.hostname;
  var ip = addrInfo.ip ? addrInfo.ip.split('.') : undefined;

  var q, params;
  if (hostname) {
    q = 'UPDATE banned_addresses SET weight = $1, decay = $2, updates = array_cat(updates, \'{now()}\') WHERE hostname = $3 RETURNING hostname, weight, decay, created_at, updates';
    params = [ addrInfo.weight, addrInfo.decay, hostname ];
  }
  else {
    q = 'UPDATE banned_addresses SET weight = $1, decay = $2, updates = array_cat(updates, \'{now()}\') WHERE ip1 = $3 AND ip2 = $4 AND ip3 = $5 AND ip4 = $6 RETURNING ip1, ip2, ip3, ip4, weight, decay, created_at, updates';
    params = [ addrInfo.weight, addrInfo.decay, ip[0], ip[1], ip[2], ip[3] ];
  }

  return db.scalar(q, params);
};

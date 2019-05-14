var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var common = require(path.normalize(__dirname + '/common'));
var Promise = require('bluebird');
var using = Promise.using;

module.exports = function(addresses) {
  return using(db.createTransaction(), function(client) {
    return Promise.map(addresses, function(addrInfo) {
      var hostname = addrInfo.hostname;
      var ip = addrInfo.ip ? addrInfo.ip.split('.') : undefined;
      var weight = addrInfo.weight;
      var decay = addrInfo.decay || false;
      var q, params;
      if (hostname) {
        q = 'SELECT hostname, weight, decay, created_at, updates FROM banned_addresses WHERE hostname = $1';
        params = [ hostname ];
      }
      else {
        q = 'SELECT ip1, ip2, ip3, ip4, weight, decay, created_at, updates FROM banned_addresses WHERE ip1 = $1 AND ip2 = $2 AND ip3 = $3 AND ip4 = $4';
        params = [ ip[0], ip[1], ip[2], ip[3] ];
      }
      return client.query(q, params)
      .then(function(results) {
        var banData = results.rows.length ? results.rows[0] : undefined;
        // Existing Ban: Hostname
        if (banData && banData.hostname) {
          q = 'UPDATE banned_addresses SET weight = $1, decay = $2, updates = array_cat(updates, \'{now()}\') WHERE hostname = $3 RETURNING hostname, weight, decay, created_at, updates';
          params = [ weight, decay, hostname ];
        }
        // Existing Ban: IP address or Proxy IP
        else if (banData) {
          q = 'UPDATE banned_addresses SET weight = $1, decay = $2, updates = array_cat(updates, \'{now()}\') WHERE ip1 = $3 AND ip2 = $4 AND ip3 = $5 AND ip4 = $6 RETURNING ip1, ip2, ip3, ip4, weight, decay, created_at, updates';
          // If ip decays calculate new score
          if (banData.decay && decay) {
            // Get existing decayed weight since ip was last seen
            weight = common.calculateScoreDecay(banData);
            // Since this ip has been previously banned run through algorithm
            // min(2 * old_score, old_score + 1000) to get new weight where
            // old_score accounts for previous decay
            weight = Math.min(2 * weight, weight + 1000);
          }
          params = [ weight, decay, ip[0], ip[1], ip[2], ip[3] ];
        }
        else if (hostname) { // New Ban: Hostname
          q = 'INSERT INTO banned_addresses(hostname, weight, decay, created_at) VALUES($1, $2, $3, now()) RETURNING hostname, weight, decay, created_at, updates';
          params = [ hostname, weight, decay ];
        }
        else { // New Ban: IP Address or Proxy IP
          q = 'INSERT INTO banned_addresses(ip1, ip2, ip3, ip4, weight, decay, created_at) VALUES($1, $2, $3, $4, $5, $6, now()) RETURNING ip1, ip2, ip3, ip4, weight, decay, created_at, updates';
            params = [ ip[0], ip[1], ip[2], ip[3], weight, decay ];
        }
        return client.query(q, params)
        .then(function(results) { return results.rows; });
      });
    });
  });
};

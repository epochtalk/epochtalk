var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var common = require(path.normalize(__dirname + '/common'));
var reverse = Promise.promisify(require('dns').reverse);

module.exports = function(opts) {
  var ip = opts.ip;
  var userId = helper.deslugify(opts.userId);
  // EG: 127.0.0.1
  var ipArr = ip.split('.');

  // Base select statement for querying banend addresses
  var baseQuery = 'SELECT weight, decay, created_at, updates FROM banned_addresses';

  var maliciousScore = null;

  // 1) Calculate sum for hostname matches
  var hostnameScore = reverse(ip)
  .map(function(hostname) { // Calculate hostname score
    return db.scalar(baseQuery + ' WHERE $1 LIKE hostname', [ hostname ])
    .then(common.calculateScoreDecay); // Calculate decay for each result
  })
  .then(common.sumArr) // Sum the weight for each match
  .catch(function() { return 0; }); // hostname doesn't exit for ip return 0 for weight

  // 2) Get score for ip32 (There should only be 1 match since address is unique)
  var ip32Score = db.scalar(baseQuery + ' WHERE ip1 = $1 AND ip2 = $2 AND ip3 = $3 AND ip4 = $4', [ ipArr[0], ipArr[1], ipArr[2], ipArr[3] ])
  .then(common.calculateScoreDecay); // calculate the decayed weight for full ip match

  // 3) Calculate sum for ip24 matches
  var ip24Score = db.sqlQuery(baseQuery + ' WHERE ip1 = $1 AND ip2 = $2 AND ip3 = $3', [ ipArr[0], ipArr[1], ipArr[2] ])
  .map(common.calculateScoreDecay) // calculate decayed weight for each ip24 match
  .then(common.sumArr); // sum all decayed weights for ip24

  // 4) calculate sum for ip16 matches
  var ip16Score = db.sqlQuery(baseQuery + ' WHERE ip1 = $1 AND ip2 = $2', [ ipArr[0], ipArr[1] ])
  .map(common.calculateScoreDecay) // calculate decayed weight for each ip16 match
  .then(common.sumArr); // sum all decayed weights for ip16

  // Run queries for hostname, ip32, ip24, ip16
  return Promise.join(hostnameScore, ip32Score, ip24Score, ip16Score, function(hostnameSum, ip32Sum, ip24Sum, ip16Sum) {
    // Return final weight sums for each
    return { hostname: hostnameSum, ip32: ip32Sum, ip24: ip24Sum, ip16: ip16Sum };
  })
  // Malicious score calculated using: hostnameSum + ip32Sum + 0.04 * ip24Sum + 0.0016 * ip16Sum
  .then(function(sums) {
    maliciousScore = sums.hostname + sums.ip32 + 0.04 * sums.ip24 + 0.0016 * sums.ip16;
    return maliciousScore;
  })
  .then(function() {
    if (userId) {
      var q = 'UPDATE users SET malicious_score = $1 WHERE id = $2';
      return db.sqlQuery(q, [ maliciousScore, userId ])
      .then(function() { return maliciousScore; });
    }
    else { return maliciousScore; }
  });
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');

// Calculates the set of users in a user's trust network
// maxDepth is configured by the user
module.exports = function(userId, maxDepth, debug) {
  userId = helper.deslugify(userId);
  var sources = [];
  var untrusted = {};
  var last = [userId];
  var depth = []; // array of indexes to iterate over with promise.each
  for (var o = 0; o <= maxDepth; o++) { depth.push(o); }
  return Promise.each(depth, function(i) {
    if (debug) { debug[i] = []; }

    var votes = {};
    if (last.length === 0) { return; }
    var trustQuery = 'SELECT user_id_trusted, type FROM trust WHERE user_id = ANY($1)';
    return db.sqlQuery(trustQuery, [last])
    .then(function(trustInfo) {
      trustInfo = trustInfo || [];
      for (var x = 0; x < trustInfo.length; x++) {
        if (!votes[trustInfo[x].user_id_trusted]) { votes[trustInfo[x].user_id_trusted] = 0; }
        if (trustInfo[x].type === 1) { votes[trustInfo[x].user_id_trusted] -= 1; }
        else { votes[trustInfo[x].user_id_trusted] += 1; }
      }

      last = []; // clear out last array
      for (var y = 0; y < trustInfo.length; y++) {
        var curId = trustInfo[y].user_id_trusted;
        var curVotes = votes[curId];
        if (debug && !untrusted[curId]) {
          var exists = false;
          for(var n = 0; n < debug[i].length; n++) {
            exists = debug[i][n][0] === curId;
            if (exists) { break; }
          }
          // Don't add duplicates ( There should be a better way to do this )
          // Debug could be a nested object instead of a nested array
          if (!exists) { debug[i].push([curId, curVotes]); }
        }

        if (votes[curId] >= 0 && !untrusted[curId]) {
          sources.push(curId);
          last.push(curId);
        }
        else { untrusted[curId] = 1; }
      }

      if (last.length === 0 && i === 0 && Object.keys(votes).length === 0) {
        // Get default trust user id here
        var defaultTrustUserId = '537d639c-3b50-4545-bea1-8b38accf408e';
        last.push(defaultTrustUserId);
        sources.push(defaultTrustUserId);

        if (debug) { debug[0].push([defaultTrustUserId, 0]); }
      }
    });
  })
  .then(function() {
    sources.push(userId);
    if (debug) { debug[0].push([userId, 0]); }

    // return unique ids
    return sources.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
  });
};

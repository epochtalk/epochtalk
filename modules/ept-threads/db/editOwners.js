var path = require('path');
var Promise = require("bluebird");
var dbc = require(path.normalize(__dirname + '/db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(options) {
  var ownerids = [];
  var owners = options.users;
  var threadId = helper.deslugify(options.threadId);
  var queries = owners.map(function(username){
    var q = 'SELECT id FROM users WHERE username = $1;';
    var params = [username];

    return db.sqlQuery(q, params);
  });

  Promise.all(queries).then(function(results){
      results.forEach(function (rows) {
          if (rows.length > 0) { ownerids.push(rows[0].id);}
          else { return undefined; }
      });
  }).then(function() {
      return db.sqlQuery('DELETE FROM thread_owners_mapping WHERE thread_id = $1', [threadId])
  }).then(function(){
      return ownerids.map(function(userId){
          var q = 'INSERT INTO thread_owners_mapping (thread_id, user_id) VALUES ($1, $2);';
          var params = [threadId, userId];

          return db.sqlQuery(q, params);
      })
  }).then(function(queries){
      Promise.all(queries);
  });
};

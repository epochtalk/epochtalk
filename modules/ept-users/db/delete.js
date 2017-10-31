var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q;

  return using(db.createTransaction(), function(client) {
    // delete user bans TODO: cascade delete?
    q = 'DELETE FROM users.bans WHERE user_id = $1';
    return client.query(q, [userId])
    // delete user roles TODO: cascade delete?
    .then(function() {
      q = 'DELETE FROM roles_users WHERE user_id = $1';
      return client.query(q, [userId]);
    })
    // get threads user has started
    .then(function() {
      q = ' SELECT thread_id FROM ( SELECT DISTINCT(thread_id) AS id FROM posts WHERE user_id = $1 ) t LEFT JOIN LATERAL ( SELECT thread_id FROM (SELECT user_id, thread_id FROM posts WHERE thread_id = t.id ORDER BY created_at LIMIT 1) f WHERE f.user_id = $1 ) pFirst ON true WHERE thread_id IS NOT NULL';
      return client.query(q, [userId]);
    })
    // parse out thread ids
    .then(function(userThreads) {
      var threads = [];
      userThreads.rows.forEach(function(thread) {
        threads.push(thread.thread_id);
      });
      return threads;
    })
    // delete user's thread
    .then(function(userThreads) {
      q = 'DELETE FROM threads WHERE id = ANY($1::uuid[])';
      return client.query(q, [userThreads]);
    })
    // delete user
    .then(function() {
      q = 'DELETE FROM users WHERE id = $1 RETURNING username, email';
      return client.query(q, [userId])
      .then(function(results) { return results.rows[0]; });
    });
  });
};

var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

var userThreadViewExists = function(userId, threadId, client) {
  var q = 'SELECT * FROM users.thread_views WHERE user_id = $1 AND thread_id = $2 FOR UPDATE';
  var params = [userId, threadId];
  return client.query(q, params)
  .then(function(results) {
    if (results.rows.length > 0) { return results.rows[0]; }
    else { return; }
  });
};

var insertUserThreadview = function(userId, threadId, client) {
  var q = 'INSERT INTO users.thread_views (user_id, thread_id, time) VALUES ($1, $2, now()) RETURNING thread_id';
  var params = [userId, threadId];
  return client.query(q, params);
};

var updateUserThreadview = function(userId, threadId, client) {
  var q = 'UPDATE users.thread_views SET time = now() WHERE user_id = $1 AND thread_id = $2';
  var params = [userId, threadId];
  return client.query(q, params);
};

module.exports = function(userId, threadId) {
  userId = helper.deslugify(userId);
  threadId = helper.deslugify(threadId);

  return using(db.createTransaction(), function(client) {
    // query for existing user-thread row for user view
    return userThreadViewExists(userId, threadId, client)
    // update or insert user-thread row
    .then(function(row) {
      if (row) { return updateUserThreadview(userId, threadId, client); }
      else { return insertUserThreadview(userId, threadId, client); }
    })
    .then(function() { return { user_id: userId, thread_id: threadId }; })
    .then(helper.slugify);
  });
};


var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

/**
 * This has a trigger attached to the threads table that will increment the
 * board's thread count on each new thread. The metadata.threads table also has a
 * trigger to update the board's post_count when metadata.threads's post_count is
 * changed. It also updates the board's last post information.
 */
module.exports = function(thread) {
  thread = helper.deslugify(thread);
  var q, params;
  return using(db.createTransaction(), function(client) {
    q = 'INSERT INTO threads(board_id, locked, sticky, moderated, created_at) VALUES ($1, $2, $3, $4, now()) RETURNING id';
    params = [thread.board_id, thread.locked, thread.sticky, thread.moderated];
    return client.queryAsync(q, params)
    .then(function(results) { thread.id = results.rows[0].id; })
    // insert thread metadata
    .then(function() {
      q = 'INSERT INTO metadata.threads (thread_id, views) VALUES($1, 0);';
      return client.queryAsync(q, [thread.id]);
    })
    // insert users
    .then(function() {
        if(thread.coOwners) {
            Object.keys(thread.coOwners.users).forEach(function(key){
                var username = thread.coOwners.users[key];
                q = 'SELECT id FROM users WHERE username = $1';
                client.queryAsync(q, [username])
                .then(function(results) {
                  var user_owner_id = results.rows[0].id;
                  q = 'INSERT INTO thread_owners_mapping (thread_id, user_id) VALUES($1, $2);';
                  client.queryAsync(q, [thread.id, user_owner_id]);
                });
            });
        }
    });
  })
  .then(function() { return helper.slugify(thread); });
};

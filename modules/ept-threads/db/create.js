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
    q = 'INSERT INTO threads(board_id, locked, sticky, moderated, slug, created_at) VALUES ($1, $2, $3, $4, $5, now()) RETURNING id';
    params = [thread.board_id, thread.locked, thread.sticky, thread.moderated, thread.slug];
    return client.query(q, params)
    .then(function(results) { thread.id = results.rows[0].id; })
    // insert thread metadata
    .then(function() {
      q = 'INSERT INTO metadata.threads (thread_id, views) VALUES($1, 0);';
      return client.query(q, [thread.id]);
    });
  })
  .then(function() { return helper.slugify(thread); });
};

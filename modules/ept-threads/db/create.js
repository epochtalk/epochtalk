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
  return using(db.createTransaction(), function(client) { return createThread(thread, client) })
  .then(function() { return helper.slugify(thread); })
  .catch(function(err) {
    if (err && err.constraint === 'threads_slug_index') {
      return handleSlugConflict(thread);
    }
    else { throw err; }
  });
};

// TODO: counting conflicts should be done in a trigger possibly so we dont have to count on
// the fly when there is a conflict.
function handleSlugConflict(thread) {
  return using(db.createTransaction(), function(client) {
    var q = 'SELECT COUNT(*) FROM threads WHERE slug LIKE $1 OR slug LIKE $2 OR slug LIKE $3 OR slug LIKE $4';
    return client.query(q, [thread.slug + '-_', thread.slug + '-__', thread.slug + '-___', thread.slug + '-____'])
    .then(function(results) {
      thread.slug = thread.slug + '-' + (Number(results.rows[0].count) + 1);
      helper.slugify(thread);
      return createThread(thread, client);
    });
  })
  .then(function() { return helper.slugify(thread); });
}

function createThread(thread, client) {
  thread = helper.deslugify(thread);
  var q = 'INSERT INTO threads(board_id, locked, sticky, moderated, slug, created_at) VALUES ($1, $2, $3, $4, $5, now()) RETURNING id';
  var params = [thread.board_id, thread.locked, thread.sticky, thread.moderated, thread.slug];
  return client.query(q, params)
  .then(function(results) { thread.id = results.rows[0].id; })
  // insert thread metadata
  .then(function() {
    q = 'INSERT INTO metadata.threads (thread_id, views) VALUES($1, 0);';
    return client.query(q, [thread.id]);
  });
}

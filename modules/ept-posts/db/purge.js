var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(id) {
  id = helper.deslugify(id);

  /*
   * There is a DB trigger on posts that will update the thread's post_count,
   * thread's updated_at, and user's post_count. This trigger will also trigger
   * another trigger on metadata.threads that updates the board's post_count and
   * board's last post information.
   */
  return using(db.createTransaction(), function(client) {
    var q = 'DELETE FROM posts WHERE id = $1 RETURNING user_id, thread_id';
    return client.queryAsync(q, [id])
    .then(function(results) { return results.rows[0]; });
  })
  .then(helper.slugify);
};

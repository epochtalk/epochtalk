var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

/**
 * This sets off a trigger that updates the metadata.boards' thread_count and
 * post_count accordingly. It also updates the metadata.boards' last post
 * information.
 */

module.exports = function(threadId) {
  threadId = helper.deslugify(threadId);
  var result = { thread_id: threadId };
  var q, posterIds;
  var queryUpdateUserPostCount = 'UPDATE users.profiles SET post_count = post_count - 1 WHERE user_id = $1'

  return using(db.createTransaction(), function(client) {
    q = 'SELECT user_id FROM posts where thread_id = $1';
    return client.query(q, [threadId])
    .then(function(results) {
      posterIds = results.rows.map(function(data) { return data.user_id; });
      posterIds = Array.from(new Set(posterIds));;
      return Promise.each(results.rows, function(data) {
        return client.query(queryUpdateUserPostCount, [data.user_id])
      });
    })
    .then(function() {
      q = 'SELECT user_id, content ->> \'title\' as title FROM posts where thread_id = $1 ORDER BY created_at ASC LIMIT 1';
      return client.query(q, [threadId])
    })
    .then(function(results) {
      var row = results.rows[0];
      result.title = row.title;
      result.user_id = row.user_id;

      // lock up thread and Meta
      q = 'DELETE FROM threads WHERE id = $1 returning board_id';
      return client.query(q, [threadId]);
    })
    .then(function(results) {
      var row = results.rows[0];
      result.board_id = row.board_id;
      result.poster_ids = posterIds;
      return result;
    });
  })
  .then(helper.slugify);
};

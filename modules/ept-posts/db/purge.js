var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(id) {
  id = helper.deslugify(id);

  var querySelectPost = 'SELECT * from posts WHERE id = $1 FOR UPDATE';
  var queryDeletePost = 'DELETE FROM posts WHERE id = $1 RETURNING user_id, thread_id';
  var queryUpdateUserPostCount = 'UPDATE users.profiles SET post_count = post_count - 1 WHERE user_id = $1'
  var queryUpdateThreadUpdatedAt = 'UPDATE threads SET updated_at = (SELECT created_at FROM posts WHERE thread_id = $1 ORDER BY created_at DESC limit 1) WHERE id = $1';
  var queryUpdatePostPositions = 'UPDATE posts SET position = position - 1 WHERE position > $1 AND thread_id = $2';
  var queryUpdateThreadPostCount = 'UPDATE threads SET post_count = post_count - 1 WHERE id = $1';
  var post;

  /*
   * There is a DB trigger on posts that will update the thread's post_count,
   * thread's updated_at, and user's post_count. This trigger will also trigger
   * another trigger on metadata.threads that updates the board's post_count and
   * board's last post information.
   */
  return using(db.createTransaction(), function(client) {
    return client.query(querySelectPost, [id])
      .then(function(results) {
        if (results.rows.length > 0) { post = results.rows[0]; }
        else { return Promise.reject('Post Not Found'); }
      })
      .then(function() {
        return client.query(queryDeletePost, [post.id]);
      })
      .then(function() {
        return client.query(queryUpdateUserPostCount, [post.user_id]);
      })
      .then(function() {
        return client.query(queryUpdateThreadUpdatedAt, [post.thread_id]);
      })
      .then(function() {
        return client.query(queryUpdatePostPositions, [post.position, post.thread_id]);
      })
      .then(function() {
        if (!post.deleted) {
          return client.query(queryUpdateThreadPostCount, [post.thread_id]);
        }
      });
  })
  .then(helper.slugify);
};

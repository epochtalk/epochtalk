var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var DeletionError = errors.DeletionError;

module.exports = function(id) {
  id = helper.deslugify(id);
  var post;
  var querySelectPost = 'SELECT * from posts WHERE id = $1 FOR UPDATE';
  // deletion flag
  var queryDeletePost = 'UPDATE posts SET deleted = TRUE WHERE id = $1';
  var queryUpdateUserPostCount = 'UPDATE users.profiles SET post_count = post_count - 1 WHERE user_id = $1'
  var queryUpdateThreadUpdatedAt = 'UPDATE threads SET updated_at = (SELECT created_at FROM posts WHERE thread_id = $1 ORDER BY created_at DESC limit 1) WHERE id = $1';
  var queryUpdatePostPositions = 'UPDATE posts SET position = position - 1 WHERE position > $1 AND thread_id = $2';
  var queryUpdateThreadPostCount = 'UPDATE threads SET post_count = post_count - 1 WHERE id = $1';


  return using(db.createTransaction(), function(client) {
    // lock up post row
    return client.queryAsync(querySelectPost, [id])
    .then(function(results) {
      if (results.rows.length > 0) { post = results.rows[0]; }
      else { return Promise.reject('Post Not Found'); }
    })
    // check if post already deleted
    .then(function() {
      if (post.deleted) { throw new DeletionError('Post Already Deleted'); }
    })
    // set post deleted flag
    .then(function() {
      return client.queryAsync(queryDeletePost, [id]);
    })
    .then(function() {
      if (!post.deleted) return client.queryAsync(queryUpdateUserPostCount, [post.user_id]);
    })
    .then(function() {
      if (!post.deleted) return client.queryAsync(queryUpdateThreadUpdatedAt, [post.thread_id]);
    })
    .then(function() {
      return client.queryAsync(queryUpdatePostPositions, [post.position, post.thread.id]);
    })
    .then(function() {
      if (!post.deleted) return client.queryAsync(queryUpdateThreadPostCount, [post.thread.id]);
    })
    .then(function() {
      post.deleted = true;
      // Strip unneeded return fields
      delete post.tsv;
      return post;
    })
    .then(helper.slugify);
  });
};

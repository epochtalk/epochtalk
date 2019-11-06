var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(post, authedUser) {
  post = helper.deslugify(post);
  var authedId = helper.deslugify(authedUser.id);
  return using(db.createTransaction(), function(client) {
    var q, params;
    q = 'SELECT content ->> \'title\' as title, content ->> \'body\' as body, metadata, created_at, user_id FROM posts WHERE id = $1 FOR UPDATE';
    return client.query(q, [post.id])
    .then(function(results) {
      if (results.rows.length > 0) { return results.rows[0]; }
      else { throw new NotFoundError('Post Not Found'); }
    })
    .then(function(oldPost) {
      post.title = post.title || oldPost.title;
      helper.updateAssign(post, oldPost, post, 'body');
      post.thread_id = post.thread_id || oldPost.thread_id;
      post.metadata = oldPost.metadata || {};
      if (authedId !== oldPost.user_id) {
        post.metadata.edited_by_id = authedId;
        post.metadata.edited_by_username = authedUser.username;
      }
      else {
        delete post.metadata.edited_by_id;
        delete post.metadata.edited_by_username;
      }
    })
    .then(function() {
      let post_content = {title: post.title, body: post.body};
      if (post.metadata) {
        q = 'UPDATE posts SET content = $1, thread_id = $2, metadata = $3, updated_at = now() WHERE id = $4 RETURNING updated_at, position, user_id, metadata';
        params = [post_content, post.thread_id, post.metadata, post.id];
      }
      else {
        q = 'UPDATE posts SET content = $1, thread_id = $2, updated_at = now() WHERE id = $3 RETURNING updated_at, position, user_id, metadata';
        params = [post_content, post.thread_id, post.id];
      }
      return client.query(q, params)
      .then(function(results) {
        var dbPost = results.rows[0];
        post.updated_at = dbPost.updated_at;
        post.position = dbPost.position;
        post.user_id = dbPost.user_id;
        post.metadata = dbPost.metadata;
        return post;
      });
    });
  })
  .then(function() { return helper.slugify(post); });
};

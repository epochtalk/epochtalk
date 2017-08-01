var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var CreationError = errors.CreationError;

module.exports = function(post) {
  post = helper.deslugify(post);
  post.deleted = post.deleted || false;
  post.locked = post.locked || false;

  var post_json = {title: post.title, body: post.body};

  var q, params;
  q = 'INSERT INTO posts(thread_id, user_id, content, deleted, locked, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING id, created_at';
  queryIncUserPostCount = 'UPDATE users.profiles SET post_count = post_count + 1 WHERE user_id = $1';
  queryUpdateThreadCreatedAt = 'UPDATE threads SET created_at = (SELECT created_at FROM posts WHERE thread_id = $1 ORDER BY created_at limit 1) WHERE id = $1'
  queryUpdateThreadUpdatedAt = 'UPDATE threads SET updated_at = (SELECT created_at FROM posts WHERE thread_id = $1 ORDER BY created_at DESC limit 1) WHERE id = $1'
  queryUpdatePostPosition = 'UPDATE posts SET position = (SELECT post_count + 1 + (SELECT COUNT(id) FROM posts WHERE thread_id = $1 AND deleted = true) FROM threads WHERE id = $1) WHERE id = $2';
  queryIncThreadPostCount = 'UPDATE threads SET post_count = post_count + 1 WHERE id = $1';

  params = [post.thread_id, post.user_id, post_json, post.deleted, post.locked];

  return using(db.createTransaction(), function(client) {
    return client.queryAsync(q, params)
    .then(function(results) {
      if (results.rows.length > 0) {
        post.id = results.rows[0].id;
        post.created_at = results.rows[0].created_at;
      }
      else {
        throw new CreationError('Post Could Not Be Saved');
      }
    })
    .then(function() {
      return client.queryAsync(queryIncUserPostCount, [post.user_id]);
    })
    .then(function() {
      return client.queryAsync(queryUpdateThreadCreatedAt, [post.thread_id]);
    })
    .then(function() {
      return client.queryAsync(queryUpdateThreadUpdatedAt, [post.thread_id]);
    })
    .then(function() {
      return client.queryAsync(queryUpdatePostPosition, [post.thread_id, post.id]);
    })
    .then(function() {
      return client.queryAsync(queryIncThreadPostCount, [post.thread_id]);
    });
  })
  .then(function() { return helper.slugify(post); });
};

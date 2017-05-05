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

  var q, params;
  q = 'INSERT INTO posts(thread_id, user_id, title, body, raw_body, deleted, locked, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now()) RETURNING id, created_at';
  params = [post.thread_id, post.user_id, post.title, post.body, post.raw_body, post.deleted, post.locked];
  return using(db.createTransaction(), function(client) {
    return client.queryAsync(q, params)
    .then(function(results) {
      if (results.rows.length > 0) {
        post.id = results.rows[0].id;
        post.created_at = results.rows[0].created_at;
      }
      else { throw new CreationError('Post Could Not Be Saved'); }
    });
  })
  .then(function() { return helper.slugify(post); });
};

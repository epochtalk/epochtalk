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
  var q;

  return using(db.createTransaction(), function(client) {
    // lock up post row
    q = 'SELECT * from posts WHERE id = $1 FOR UPDATE';
    return client.query(q, [id])
    .then(function(results) {
      if (results.rows.length > 0) { post = results.rows[0]; }
      else { return Promise.reject('Post Not Found'); }
    })
    // check if post is deleted
    .then(function() {
      if (!post.deleted) { throw new DeletionError('Post Not Deleted'); }
    })
    // set post deleted flag
    .then(function() {
      post.deleted = false;
      // Remove hidden_by metadata when unlocked
      if (post.metadata) {
        delete post.metadata.hidden_by_id;
        delete post.metadata.hidden_by_priority;
        var metadata = Object.keys(post.metadata).length ? post.metadata : null;
        q = 'UPDATE posts SET deleted = FALSE, metadata = $1 WHERE id = $2';
        return client.query(q, [metadata, id]);
      }
      else {
        q = 'UPDATE posts SET deleted = FALSE WHERE id = $1';
        return client.query(q, [id]);
      }
    })
    .then(function() { return post; })
    .then(helper.slugify);
  });
};

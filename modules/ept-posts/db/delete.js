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
    return client.queryAsync(q, [id])
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
      post.deleted = true;
      q = 'UPDATE posts SET deleted = TRUE WHERE id = $1';
      return client.queryAsync(q, [id]);
    })
    .then(function() {
      // Strip unneeded return fields
      delete post.tsv;
      return post;
    })
    .then(helper.slugify);
  });
};

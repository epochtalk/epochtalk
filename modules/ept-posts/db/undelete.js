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
      q = 'UPDATE posts SET deleted = False WHERE id = $1';
      return client.query(q, [id]);
    })
    .then(function() { return post; })
    .then(helper.slugify);
  });
};

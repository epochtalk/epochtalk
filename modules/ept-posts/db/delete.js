var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var dbc = require(path.normalize(__dirname + '/db'));
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var DeletionError = errors.DeletionError;

module.exports = function(req) {
  id = helper.deslugify(req.params.id);
  var hiddenById = helper.deslugify(req.auth.credentials.id);
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
    // check if post already deleted
    .then(function() {
      if (post.deleted) { throw new DeletionError('Post Already Deleted'); }
    })
    // Attach hidden_by metadata if user hiding post isnt post owner
    .then(function() {
      if (post.user_id !== hiddenById) {
        return req.db.users.find(req.auth.credentials.id)
        .then(function(locker) {
          var priority = _.min(_.map(locker.roles, 'priority'));
          if (post.metadata) {
            post.metadata.hidden_by_id = hiddenById;
            post.metadata.hidden_by_priority = priority;
            return post.metadata;
          }
          else {
            return {
              hidden_by_id: hiddenById,
              hidden_by_priority: priority
            }
          }
        });
      }
      else { return; }
    })
    // set post deleted flag
    .then(function(metadata) {
      post.deleted = true;
      if (metadata) {
        post.metadata = metadata;
        q = 'UPDATE posts SET deleted = TRUE, metadata = $1 WHERE id = $2';
        return client.query(q, [metadata, id]);
      }
      else {
        q = 'UPDATE posts SET deleted = TRUE WHERE id = $1';
        return client.query(q, [id]);
      }
    })
    .then(function() {
      // Strip unneeded return fields
      delete post.tsv;
      return post;
    })
    .then(helper.slugify);
  });
};

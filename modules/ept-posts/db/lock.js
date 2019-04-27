var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var dbc = require(path.normalize(__dirname + '/db'));
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

module.exports = function(req) {
  var id = helper.deslugify(req.params.id);
  var lockerId = helper.deslugify(req.auth.credentials.id);
  var post;
  var q;

  return using(db.createTransaction(), function(client) {
    // lock up post row
    q = 'SELECT * from posts WHERE id = $1 FOR UPDATE';
    return client.query(q, [id])
    .then(function(results) {
      if (results.rows.length > 0) { post = results.rows[0]; }
      else { throw new NotFoundError('Post Not Found'); }
    })
    // Attach locked_by metadata if user locking post isnt post owner
    .then(function() {
      if (post.user_id !== lockerId) {
        return req.db.users.find(req.auth.credentials.id)
        .then(function(locker) {
          var priority =  _.min(_.map(locker.roles, 'priority'))
          if (post.metadata) {
            post.metadata.locked_by_id = lockerId;
            post.metadata.locked_by_priority = priority;
            return post.metadata
          }
          else {
            return {
              locked_by_id: lockerId,
              locked_by_priority: priority
            };
          }
        });
      }
      else { return; }
    })
    // set post locked flag
    .then(function(metadata) {
      post.locked = true;
      if (metadata) {
        post.metadata = metadata;
        q = 'UPDATE posts SET locked = TRUE, metadata = $1 WHERE id = $2';
        return client.query(q, [metadata, id]);
      }
      else {
        q = 'UPDATE posts SET locked = TRUE WHERE id = $1';
        return client.query(q, [id]);
      }
    })
    .then(function() { return post; })
    .then(helper.slugify);
  });
};

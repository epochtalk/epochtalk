var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var NotFoundError = Promise.OperationalError;
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;

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
      else { throw new NotFoundError('Post Not Found'); }
    })
    // set post locked flag
    .then(function() {
      post.locked = true;
      q = 'UPDATE posts SET locked = TRUE WHERE id = $1';
      return client.queryAsync(q, [id]);
    })
    .then(function() { return post; })
    .then(helper.slugify);
  });
};

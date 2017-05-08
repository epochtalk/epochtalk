var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var NotFoundError = Promise.OperationalError;
var using = Promise.using;
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(post) {
  post = helper.deslugify(post);
  return using(db.createTransaction(), function(client) {
    var q, params;
    q = 'SELECT content ->> \'title\' as title, content ->> \'body\' as body FROM posts WHERE id = $1 FOR UPDATE';
    return client.queryAsync(q, [post.id])
    .then(function(results) {
      if (results.rows.length > 0) { return results.rows[0]; }
      else { throw new NotFoundError('Post Not Found'); }
    })
    .then(function(oldPost) {
      post.title = post.title || oldPost.title;
      helper.updateAssign(post, oldPost, post, 'body');
      post.thread_id = post.thread_id || oldPost.thread_id;
    })
    .then(function() {
      console.log("POST");
      console.log(post);
      q = 'UPDATE posts SET content = content || \'{"title": $1, "body": $2}\', thread_id = $3, updated_at = now() WHERE id = $4 RETURNING updated_at';
      params = [post.title, post.body, post.thread_id, post.id];
      return client.queryAsync(q, params)
      .then(function(results) { post.updated_at = results.rows[0].updated_at; });
    });
  })
  .then(function() { return helper.slugify(post); });
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(postId, url) {
  postId = helper.deslugify(postId);
  var q = 'INSERT INTO images_posts (image_url, post_id) VALUES ($1, $2)';
  return db.sqlQuery(q, [url, postId]);
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(postId) {
  postId = helper.deslugify(postId);
  var q = 'UPDATE images_posts SET post_id = NULL WHERE post_id = $1';
  return db.sqlQuery(q, [postId]);
};

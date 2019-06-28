var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(url) {
  var q = 'SELECT post_id FROM images_posts WHERE image_url = $1';
  return db.sqlQuery(q, [url]).then(helper.slugify);
};

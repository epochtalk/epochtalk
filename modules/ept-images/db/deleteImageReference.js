var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(id) {
  id = helper.deslugify(id);
  var q = 'DELETE FROM images_posts WHERE id = $1';
  return db.sqlQuery(q, [id]);
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  var q = 'SELECT p.*, t.* FROM posts p LEFT JOIN threads t ON p.thread_id = t.id LIMIT 30;';
  return db.sqlQuery(q)
  .then(helper.slugify);
};

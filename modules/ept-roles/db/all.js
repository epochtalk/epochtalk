var path = require('path');
var db = require(path.normalize(__dirname + '/../db'));
var helper = require(path.normalize(__dirname + '/../helper'));

module.exports = function() {
  var q = 'SELECT id, name, description, lookup, priority, highlight_color, permissions FROM roles ORDER BY priority';
  return db.sqlQuery(q)
  .then(helper.slugify);
};

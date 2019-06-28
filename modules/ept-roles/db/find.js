var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(roleId) {
  var q = 'SELECT id, name, description, lookup, priority, highlight_color, permissions FROM roles WHERE id = $1';
  return db.scalar(q, [helper.deslugify(roleId)])
  .then(helper.slugify);
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(factoidId) {
  factoidId = helper.deslugify(factoidId);
  var q = `DELETE FROM factoids WHERE id = $1`;
  return db.sqlQuery(q, [factoidId])
  .then(function() { return { id: factoidId }; })
  .then(helper.slugify);
};

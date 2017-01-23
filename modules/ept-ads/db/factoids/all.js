var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  var q = ``;
  opts = opts || {};
  if (opts.enabledOnly) { q = `SELECT * FROM factoids WHERE enabled = true ORDER BY created_at`; }
  else { q = `SELECT * FROM factoids ORDER BY created_at`; }
  return db.sqlQuery(q).then(helper.slugify);
};

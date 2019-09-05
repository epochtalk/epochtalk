var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  var q = `SELECT
    id,
    name,
    description,
    type,
    bct_ann,
    ann_date,
    website,
    flags,
    badges
    FROM plugins.cb_projects`;
  return db.sqlQuery(q)
  .then(helper.slugify);
};

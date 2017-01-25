var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function() {
  var q = `
  SELECT *
  FROM ads
  WHERE round = (SELECT round FROM ads.rounds WHERE current = true);
  `;
  return db.sqlQuery(q)
  .then(helper.slugify);
};

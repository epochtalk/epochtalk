var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(factoid) {
  factoid = helper.deslugify(factoid);
  var q = `
  UPDATE factoids SET (
    text,
    updated_at
  ) = ($2, now())
  WHERE id = $1;
  `;
  return db.sqlQuery(q, [factoid.id, factoid.text])
  .then(function() { return factoid; })
  .then(helper.slugify);
};

var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(factoid) {
  var q = `
  INSERT INTO factoids
  (text, created_at, updated_at)
  VALUES ($1, now(), now())
  RETURNING id;
  `;
  return db.sqlQuery(q, [factoid.text])
  .then(function(rows) {
    if (rows.length > 0) {
      factoid.id = rows[0].id;
      return factoid;
    }
    else { throw Error('Could Not Create Factoid'); }
  })
  .then(helper.slugify);
};

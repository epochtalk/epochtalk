var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(ad) {
  ad = helper.deslugify(ad);
  var q = `
  UPDATE ads SET (
    html,
    css,
    updated_at
  ) = ($2, $3, now())
  WHERE id = $1;
  `;
  return db.sqlQuery(q, [ad.id, ad.html, ad.css])
  .then(function() { return ad; })
  .then(helper.slugify);
};

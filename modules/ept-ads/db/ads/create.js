var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(ad) {
  var q = `
  INSERT INTO ads (round, html, css, created_at, updated_at)
  VALUES ($1, $2, $3, now(), now())
  RETURNING id;
  `;
  return db.sqlQuery(q, [ad.round, ad.html, ad.css])
  .then(function(rows) {
    if (rows.length > 0) {
      ad.id = rows[0].id;
      return ad;
    }
    else { throw Error('Could Not Create Ad'); }
  })
  // create ads.analytics row for this ad
  .tap(function(ad) {
    var q = `INSERT INTO ads.analytics (ad_id) VALUES ($1);`;
    return db.sqlQuery(q, [ad.id]);
  })
  .then(helper.slugify);
};

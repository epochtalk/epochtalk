var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var CreationError = errors.CreationError;

module.exports = function(adId) {
  adId = helper.deslugify(adId);
  var q = `
  INSERT INTO ads (round, html, css, created_at, updated_at)
  SELECT round, html, css, now(), now() FROM ads WHERE id = $1
  RETURNING id, round, html, css, created_at, updated_at;
  `;
  return db.sqlQuery(q, [adId])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else { throw new CreationError('Could Not Create Ad'); }
  })
  // create ads.analytics row for this ad
  .tap(function(dupAd) {
    var q = `INSERT INTO ads.analytics (ad_id) VALUES ($1);`;
    return db.sqlQuery(q, [dupAd.id]);
  })
  .then(helper.slugify);
};

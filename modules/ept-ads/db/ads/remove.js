var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(adId) {
  adId = helper.deslugify(adId);
  var q = `DELETE FROM ads WHERE id = $1`;
  return db.sqlQuery(q, [adId])
  .then(function() { return; });
};

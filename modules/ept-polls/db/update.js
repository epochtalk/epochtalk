var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(options) {
  options.id = helper.deslugify(options.id);
  var q = 'UPDATE polls SET (max_answers, change_vote, expiration, display_mode) = ($1, $2, $3, $4) WHERE id = $5';
  var params = [options.max_answers, options.change_vote, options.expiration, options.display_mode, options.id];
  return db.sqlQuery(q, params)
  .then(function() { return options; })
  .then(helper.slugify);
};

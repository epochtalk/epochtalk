var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(pollId, locked) {
  pollId = helper.deslugify(pollId);

  var q = 'UPDATE polls SET locked = $2 WHERE id = $1';
  return db.sqlQuery(q, [pollId, locked])
  .then(function() { return { id: pollId, locked }; })
  .then(helper.slugify);
};

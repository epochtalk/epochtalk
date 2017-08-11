var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

module.exports = function(opts) {
  opts = opts || {};
  opts.limit = opts.limit || 25;
  opts.page = opts.page || 1;
  opts.offset = (opts.page * opts.limit) - opts.limit;

  var q = `
    SELECT
      email,
      hash,
      created_at
    FROM invitations
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2`;
  // adjust limit to check if there's another page
  return db.sqlQuery(q, [opts.limit + 1, opts.offset]);
};

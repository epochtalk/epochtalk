var path = require('path');
var Promise = require('bluebird');
var using = Promise.using;
var dbc = require(path.normalize(__dirname + '/../db'));
var db = dbc.db;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;
var ConflictError = errors.ConflictError;

module.exports = function(round) {
  return using(db.createTransaction(), function(client) {
    // check if round can be rotated
    var check = `SELECT start_time FROM ads.rounds WHERE round = $1`;
    return client.queryAsync(check, [round])
    .then(function(response) {
      if (response.rows.length < 1) {
        throw new NotFoundError('This round does not exist');
      }
      else if (response.rows[0].start_time) {
        throw new ConflictError('This round has already been used');
      }
    })
    // lock table from being read
    .then(function() {
      var lock = `LOCK TABLE ads.rounds IN ACCESS EXCLUSIVE MODE;`;
      return client.queryAsync(lock);
    })
    // update end_time for current round
    .then(function() {
      var q = `UPDATE ads.rounds SET (current, end_time) = (false, now()) WHERE current = true;`;
      return client.queryAsync(q);
    })
    // update start time for new round
    .then(function() {
      var q = `UPDATE ads.rounds SET (current, start_time) = (true, now()) WHERE round = $1 RETURNING round, current, start_time, end_time`;
      return client.queryAsync(q, [round]);
    }).then(function(data) {
      return data.rows[0];
    });
  });
};

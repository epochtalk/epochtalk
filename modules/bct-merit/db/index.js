var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var using = Promise.using;

// calculate user's merit
// update merit for user
// return merit
function recalculateMerit(userId) {
  var queryMerit = 'SELECT SUM(amount) AS merit FROM merit_ledger WHERE to_user_id = $1';
  var updateMerit = 'UPDATE merit_users SET merit = $1 WHERE user_id = $2';

  return using(db.createTransaction(), function(client) {
    // query sum of merit transactions from merit ledger
    return client.query(queryMerit, [userId])
    .then(function(results) {
      // if there is a row returned
      // and there is a sum of merit transactions
      if (results.rows.length && results.rows[0].merit) {
        var merit = results.rows[0].merit;
        // update user's merit to the sum of merit from transactions, returning merit
        return client.query(updateMerit, [merit, userId]).then(function() { return merit; });
      }
      // otherwise, don't update the user's merit, return zero merit
      else { return 0; }
    });
  });
}

// algorithm to calculate sent merit
// during a merit transaction,
// the merit received is a fraction of the merit sent
function calculateSentMerit(userId) {
  var params = [userId];
  var smerit = 0;
  var sent = 0;
  var sources = [];
  var sends = [];
  // any time retVal gets called, the function exits
  var retVal;

  return using(db.createTransaction(), function(client) {
    // get the total amount of merit for a user
    var queryReceivedMerit = 'SELECT SUM(amount) AS merit FROM merit_ledger WHERE to_user_id = $1';
    return client.query(queryReceivedMerit, params)
    .then(function(results) {
      // sendable merit, half of the user's total merit
      if (results.rows.length) {
        smerit = results.rows[0].merit;
        smerit = smerit / 2;
      }

      // get the faucets
      // user_id -> the user that is allocated a faucet
      // time -> ??
      // amount -> ??
      var queryMeritSourcesByTime = 'SELECT time, amount FROM merit_sources WHERE user_id = $1 ORDER BY time ASC';
      return client.query(queryMeritSourcesByTime);
    })
    .then(function(results) {
      if (results.rows.length) {
        sources = results.rows.map(function(data) {
          data.time = data.time.getTime();
          return data;
        });
        sources.unshift({ time: 0, amount: 0 });

        var queryMeritByTime = 'SELECT time, amount FROM merit_ledger WHERE from_user_id = $1 ORDER BY time ASC';
        return client.query(queryMeritByTime);
      }
      else {
        var querySentMerit = 'SELECT SUM(amount) as merit FROM merit_ledger WHERE from_user_id = $1';
        return client.query(querySentMerit)
        .then(function(results) {
          if (results.rows.length) { sent = results.rows[0].merit; }
          retVal = {
            smerit: smerit - sent,
            monthLimit: 0
          };
          return retVal;
        });
      }
    })
    .then(function(results) {
      if (results.rows.length) {
        sends = results.rows.map(function(data) {
          data.time = data.time.getTime();
          return data;
        });
      }
      sends.push({ time: new Date().getTime(), amount: 0 });

      var month = 60 * 60 * 24 * 30;
      var source = 0;
      var monthLimit = 0;
      var monthTotal = 0;

      sends.forEach(function(data) {
        var time = data.time;
        var amount = data.amount;

        while (source + 1 < sources.length && time >= sources[source + 1].time) { source += 1; }
        monthLimit = sources[source].amount;

        monthTotal = 0;

        // TODO: Finish translating

      });
    });
  });
}

module.exports = {};

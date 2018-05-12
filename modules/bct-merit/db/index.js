var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var using = Promise.using;
var errors = dbc.errors;
var helper = dbc.helper;
var CreationError = errors.CreationError;

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

function calculateSendableMerit(userId) {
  userId = helper.deslugify(userId);
  var params = [userId];
  var sendableMerit = 0;
  var sent = 0;
  var sources = [];
  var sends = [];
  var q, params;

  return using(db.createTransaction(), function(client) {
    // get the total amount of merit for a user
    var queryReceivedMerit = 'SELECT SUM(amount) AS merit FROM merit_ledger WHERE to_user_id = $1';
    return client.query(queryReceivedMerit, params)
    .then(function(results) {
      if (results.rows.length) {
        sendableMerit = results.rows[0].merit;
        sendableMerit = sendableMerit / 2;
      }

      var queryMeritSourcesByTime = 'SELECT time, amount FROM merit_sources WHERE user_id = $1 ORDER BY time ASC';
      return client.query(queryMeritSourcesByTime);
    })
    .then(function(results) {
      // if there are merit sources for the user
      if (results.rows.length) {
        sources = results.rows;
        // month limit starts at latest source merit allocation amount
        var monthLimit = sources[sources.length - 1].amount;

        // calculate the total sent merit
        // in exceess of source merit for each time range:
        // (1) Before source merit was allocated
        // (2) Between source merit allocations
        // (3) After the latest source merit allocation

        // Sent merit from:
        // (1) Before source merit was allocated
        q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND time < $2';
        params = [userId, sources[0].time];

        return client.query(q, params)
        .then(function(results) {
          // (Result of sent merit from:)
          // (1) Before source merit was allocated
          // if sum is NULL, set to 0
          var startingSentMeritSum = results.rows[0].sum || 0;

          return Promise.reduce(sources, function(currentSentMeritSum, source, i) {
            // Sent merit from:
            // (3) After the latest source merit allocation
            if (i === sources.length - 1) {
              q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND time >= $2';
              params = [userId, source.time];
            }
            // Sent merit from:
            // (2) Between source merit allocations
            else {
              q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND time >= $2 AND time < $3';
              params  = [userId, source.time, sources[i + 1].time];
            }
            return client.query(q, params)
            .then(function(results) {
              var sourceMerit = source.amount;
              // if sum is NULL, set to 0
              var sentMeritSumForTimeRange = results.row[0].sum || 0;
              var sendAmountExceedingSourceMerit = sentMeritSumForTimeRange - sourceMerit;
              if (sendAmountExceedingSourceMerit < 0) { sendAmountExceedingSourceMerit = 0; }
              // update month limit, subtract merit for sends since allocated
              if (i === sources.length - 1) {
                monthLimit -= sentMeritSumForTimeRange;
                if (monthLimit < 0) { monthLimit = 0 }
              }
              return currentSentMeritSum + sendAmountExceedingSourceMerit;
            });
          }, startingSentMeritSum)
          .then(function(totalSentMeritSum) {
            return {
              // sendable merit:
              // user's merit
              // divided by 2
              // minus sent merit exceeding source merit for each source merit range
              sendableMerit: sendableMerit - totalSentMeritSum,
              // monthLimit:
              // user's current source merit
              // minus merit for sends since allocated source merit time
              monthLimit: monthLimit
            };
          });

        });
      }
      // otherwise, user has no source merit
      else {
        var querySentMerit = 'SELECT SUM(amount) as merit FROM merit_ledger WHERE from_user_id = $1';
        return client.query(querySentMerit)
        .then(function(results) {
          if (results.rows.length) { sent = results.rows[0].merit; }
          return {
            // sendable merit:
            // user's merit
            // divided by 2
            // minus sum of sends on ledger
            sendableMerit: sendableMerit - sent,
            // user has no source merit
            monthLimit: 0
          };
        });
      }
    });
  });
}

// algorithm to calculate sent merit
// during a merit transaction,
// the merit received is a fraction of the merit sent
function calculateSentMerit(userId) {
  var params = [userId];
  var sendableMerit = 0;
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
        sendableMerit = results.rows[0].merit;
        sendableMerit = sendableMerit / 2;
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
        // at time 0, you start with 0 source merit
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
            sendableMerit: sendableMerit - sent,
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
      var amount;

      sends.forEach(function(data, i) {
        var time = data.time;
        amount = data.amount;

        while (source + 1 < sources.length && time >= sources[source + 1].time) { source += 1; }
        monthLimit = sources[source].amount;

        monthTotal = 0;
        for (var j = i - 1; j >= 0; j--) {
          if (time - sends[j].time > month) { break; }
          monthTotal += sends[j].amount;
        }

        monthLimit -= monthTotal;
        if (monthLimit < 0) { monthLimit = 0; }

        sendableMerit -= Math.max(0, amount - monthLimit);
      });

      monthLimit -= amount;
      if (monthLimit < 0) { monthLimit = 0; }

      retVal = {
        sendableMerit: sendableMerit,
        monthLimit: monthLimit
      };
      return retVal;
    });
  });
}


function sendMerit(fromUserId, toUserId, postId, merits) {
  fromUserId = helper.deslugify(fromUserId);
  toUserId = helper.deslugify(toUserId);
  postId = helper.deslugify(postId);
  // These should be configs
  var maxToUser = 50;
  var maxToPost = 100;
  var totalToUser, totalToPost;

  return using(db.createTransaction(), function(client) {
    var q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND to_user_id = $2 AND time > (now() - \'1 month\'::interval)';
    var params = [fromUserId, toUserId];
    return client.query(q, params)
    .then(function(results) {
      if (results.rows.length && results.rows[0].amount) {
        totalToUser = results.rows[0].amount;
      }
      else { totalToUser = 0; }

      q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND post_id= $2';
      params = [fromUserId, postId];
      return client.query(q, params);
    })
    .then(function(results) {
      if (results.rows.length && results.rows[0].amount) {
        totalToPost = results.rows[0].amount;
      }
      else { totalToPost = 0; }

      if (totalToUser + merits > maxToUser) {

      }
    });
  });
}

module.exports = {};

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
  var updateMerit = 'INSERT INTO merit_users(user_id, merit) VALUES($1, $2) ON CONFLICT(user_id) DO UPDATE SET merit = $2';
  return using(db.createTransaction(), function(client) {
    // query sum of merit transactions from merit ledger
    return client.query(queryMerit, [userId])
    .then(function(results) {
      // if there is a row returned
      // and there is a sum of merit transactions
      if (results.rows.length && results.rows[0].merit) {
        var merit = results.rows[0].merit;
        // update user's merit to the sum of merit from transactions, returning merit
        return client.query(updateMerit, [userId, merit]).then(function() { return merit; });
      }
      // otherwise, don't update the user's merit, return zero merit
      else { return 0; }
    });
  });
}

sendMerit('2699e6f3-e137-479f-ab9f-9a7075180194', '30ad5dd2-447b-442e-9ca9-b1dd7b3e3b42', '0d189e0c-6261-4273-b4e1-f57603c5f978', 1)
.then(console.log);


function sendMerit(fromUserId, toUserId, postId, amount) {
  // fromUserId = helper.deslugify(fromUserId);
  // toUserId = helper.deslugify(toUserId);
  // postId = helper.deslugify(postId);
  // These should be configs
  var maxToUser = 50;
  var maxToPost = 100;
  var totalToUser, totalToPost;
  var sendableMerit = 0;
  var sent = 0;
  var sources = [];
  var sends = [];
  var q, params;

  var sendableUserMerit, sendableSourceMerit;

  return using(db.createTransaction(), function(client) {
    q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND to_user_id = $2 AND time > (now() - \'1 month\'::interval)';
    params = [fromUserId, toUserId];
    return client.query(q, params)
    .then(function(results) {
      totalToUser = Number(results.rows[0].sum);

      q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND post_id= $2';
      params = [fromUserId, postId];
      return client.query(q, params);
    })
    .then(function(results) {
      totalToPost = Number(results.rows[0].sum);

      if (totalToUser + amount > maxToUser) {
        throw new CreationError('You can only send ' + maxToUser + ' merit to a given user per 30 days. You have already sent ' + totalToUser + ' merit to this user within the last 30 days.');
      }
      else if (totalToPost + amount > maxToPost) {
        throw new CreationError('You can only send ' + maxToPost + ' merit to a given post. You have already sent ' + totalToPost + ' merit to this post.');
      }

      // get the total amount of merit for a user
      q = 'SELECT SUM(amount) AS merit FROM merit_ledger WHERE to_user_id = $1';
      params = [fromUserId];
      return client.query(q, params);
    })
    .then(function(results) {
      if (results.rows.length) {
        sendableMerit = results.rows[0].merit;
        sendableMerit = sendableMerit / 2;
      }

      q = 'SELECT time, amount FROM merit_sources WHERE user_id = $1 ORDER BY time ASC';
      params = [fromUserId];
      return client.query(q, params);
    })
    .then(function(results) {
      // if there are merit sources for the user
      if (results.rows.length) {
        sources = results.rows;
        var monthLimit;

        // calculate the total sent merit
        // in exceess of source merit for each time range:
        // (1) Before source merit was allocated
        // (2) Between source merit allocations
        // (3) After the latest source merit allocation

        // Sent merit from:
        // (1) Before source merit was allocated
        q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND time < $2';
        params = [fromUserId, sources[0].time];

        return client.query(q, params)
        .then(function(results) {
          // (Result of sent merit from:)
          // (1) Before source merit was allocated
          // if sum is NULL, set to 0
          var startingSentMeritSum = Number(results.rows[0].sum);
          return Promise.reduce(sources, function(currentSentMeritSum, source, i) {
            // Sent merit from:
            // (3) After the latest source merit allocation
            if (i === sources.length - 1) {
              q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND time >= $2';
              params = [fromUserId, source.time];
            }
            // Sent merit from:
            // (2) Between source merit allocations
            else {
              q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND time >= $2 AND time < $3';
              params  = [fromUserId, source.time, sources[i + 1].time];
            }

            return client.query(q, params)
            .then(function(results) {
              var sourceMeritForTimeRange = source.amount;
              // if sum is NULL, set to 0
              var sentMeritSumForTimeRange = Number(results.rows[0].sum);
              var sentMeritExceedingSourceMerit = sentMeritSumForTimeRange - sourceMeritForTimeRange;
              if (sentMeritExceedingSourceMerit < 0) { sentMeritExceedingSourceMerit = 0; }
              // set month limit:
              // latest source merit - sum of sent merit since allocation
              if (i === sources.length - 1) {
                monthLimit = sourceMeritForTimeRange - sentMeritSumForTimeRange;
                if (monthLimit < 0) { monthLimit = 0 }
              }
              return currentSentMeritSum + sentMeritExceedingSourceMerit;
            });
          }, startingSentMeritSum)
          .then(function(totalSentMeritSum) {
            // sendable merit:
            // user's merit
            // divided by 2
            // minus sent merit exceeding source merit for each source merit range
            sendableUserMerit = sendableMerit - totalSentMeritSum;
            // monthLimit:
            // user's current source merit
            // minus merit for sends since allocated source merit time
            sendableSourceMerit = monthLimit;
            return;
          });
        });
      }
      // otherwise, user has no source merit
      else {
        q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1';
        return client.query(q)
        .then(function(results) {
          sent = Number(results.rows[0].sum);
          // sendable merit:
          // user's merit
          // divided by 2
          // minus sum of sends on ledger
          sendableUserMerit = sendableMerit - sent;
          // user has no source merit
          sendableSourceMerit = 0;
          return;
        });
      }
      return;
    })
    .then(function() {
      console.log('Sendable User Merit:', sendableUserMerit);
      console.log('Sendable Source Merit:', sendableSourceMerit);
      if (sendableUserMerit + sendableSourceMerit < amount) {
        throw new CreationError('You do not have enough sendable merit.');
      }
      q = 'INSERT INTO merit_ledger(from_user_id, to_user_id, post_id, amount, time) VALUES($1, $2, $3, $4, now())';
      params = [fromUserId, toUserId, postId, amount];
      return client.query(q, params);
    });
  })
  .then(function() {
    return recalculateMerit(toUserId);
  })
  .then(function() {
    return {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      post_id: postId,
      amount: amount
    };
  });
}

module.exports = {};

var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var config = require(path.normalize(__dirname + '/../config'));
var db = dbc.db;
var using = Promise.using;
var errors = dbc.errors;
var helper = dbc.helper;
var BadRequestError = errors.BadRequestError;

function withinUserMax(fromUserId, toUserId, amount) {
  var maxToUser = config.maxToUser;
  var q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND to_user_id = $2 AND time > (now() - \'1 month\'::interval)';
  var params = [helper.deslugify(fromUserId), helper.deslugify(toUserId)];
  return db.scalar(q, params)
  .then(function(results) {
    var totalToUser = Number(results.sum);
    return totalToUser + amount <= maxToUser;
  });
}

function withinPostMax(fromUserId, postId, amount) {
  var maxToPost = config.maxToPost;
  var q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1 AND post_id = $2';
  var params = [helper.deslugify(fromUserId), helper.deslugify(postId)];
  return db.scalar(q, params)
  .then(function(results) {
    var totalToPost = Number(results.sum);
    return totalToPost + amount <= maxToPost;
  });
}

// calculate user's merit
// update merit for user
// return merit
function recalculateMerit(userId) {
  var q, params;
  return using(db.createTransaction(), function(client) {
    q = 'SELECT SUM(amount) FROM merit_ledger WHERE to_user_id = $1';
    params = [userId];
    // query sum of merit transactions from merit ledger
    return client.query(q, params)
    .then(function(results) {
      q = 'INSERT INTO merit_users(user_id, merit) VALUES($1, $2) ON CONFLICT(user_id) DO UPDATE SET merit = $2';
      var merit = Number(results.rows[0].sum);
      params = [userId, merit];
      // update user's merit to the sum of merit from transactions, returning merit
      return client.query(q, params)
      .then(function() { return merit; });
    });
  });
}

function send(fromUserId, toUserId, postId, amount) {
  return calculateSendableMerit(fromUserId, toUserId, postId, amount);
}

function calculateSendableMerit(fromUserId, toUserId, postId, amount) {
  fromUserId = helper.deslugify(fromUserId);
  toUserId = helper.deslugify(toUserId);
  postId = helper.deslugify(postId);
  var q, params, sendableUserMerit, sendableSourceMerit;
  return using(db.createTransaction(), function(client) {
    // get the total amount of merit for a user
    q = 'SELECT SUM(amount) FROM merit_ledger WHERE to_user_id = $1';
    params = [fromUserId];
    return client.query(q, params)
    .then(function(results) {
      sendableUserMerit = Number(results.rows[0].sum) / 2;

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
                if (monthLimit < 0) { monthLimit = 0; }
              }
              return currentSentMeritSum + sentMeritExceedingSourceMerit;
            });
          }, startingSentMeritSum);
        })
        .then(function(totalSentMeritSum) {
          // sendable merit:
          // user's merit
          // divided by 2
          // minus sent merit exceeding source merit for each source merit range
          sendableUserMerit -= totalSentMeritSum;
          // monthLimit:
          // user's current source merit
          // minus merit for sends since allocated source merit time
          sendableSourceMerit = monthLimit;
          return;
        });
      }
      // otherwise, user has no source merit
      else {
        q = 'SELECT SUM(amount) FROM merit_ledger WHERE from_user_id = $1';
        params = [fromUserId];
        return client.query(q, params)
        .then(function(results) {
          var sent = Number(results.rows[0].sum);
          // sendable merit:
          // user's merit
          // divided by 2
          // minus sum of sends on ledger
          sendableUserMerit -= sent;
          // user has no source merit
          sendableSourceMerit = 0;
          return;
        });
      }
      return;
    })
    .then(function() {
      // We're sending merit to someone after calculating
      if (toUserId) {
        if (sendableUserMerit + sendableSourceMerit < amount) {
          throw new BadRequestError('You do not have enough sendable merit.');
        }
        q = 'INSERT INTO merit_ledger(from_user_id, to_user_id, post_id, amount, time) VALUES($1, $2, $3, $4, now())';
        params = [fromUserId, toUserId, postId, amount];
        return client.query(q, params)
        .then(function() {
          q = 'SELECT SUM(amount) FROM merit_ledger WHERE to_user_id = $1';
          params = [toUserId];
          // query sum of merit transactions from merit ledger
          return client.query(q, params);
        })
        .then(function(results) {
          q = 'INSERT INTO merit_users(user_id, merit) VALUES($1, $2) ON CONFLICT(user_id) DO UPDATE SET merit = $2';
          var merit = Number(results.rows[0].sum);
          params = [toUserId, merit];
          // update user's merit to the sum of merit from transactions, returning merit
          return client.query(q, params);
        })
        .then(function() {
          var leftoverSourceMerit = sendableSourceMerit - amount;
          var leftoverUserMerit = sendableUserMerit;

          if (leftoverSourceMerit < 0) {
            leftoverUserMerit = leftoverUserMerit + leftoverSourceMerit;
            leftoverSourceMerit = 0;
          }
          return {
            from_user_id: helper.slugify(fromUserId),
            to_user_id: helper.slugify(toUserId),
            post_id: helper.slugify(postId),
            amount: amount,
            sendable_user_merit: leftoverUserMerit,
            sendable_source_merit: leftoverSourceMerit
          };
        });
      }
      // We're just calculating sendable merit
      else {
        return {
          sendable_user_merit: sendableUserMerit,
          sendable_source_merit: sendableSourceMerit
        }
      }
    });
  });
}

function get(userId) {
  var q = 'SELECT merit FROM merit_users WHERE user_id = $1';
  var params = [ helper.deslugify(userId) ];
  return db.scalar(q, params)
  .then(function(data) {
    var amount = data ? data.merit : 0;
    return {
      user_id: userId,
      merit: Number(amount)
    }
  });
}

function getPostMerits(postId) {
  var q = 'SELECT u.username, SUM(amount) AS amount FROM merit_ledger LEFT JOIN users u ON u.id = from_user_id WHERE post_id = $1 GROUP BY post_id, u.username';
  var params = [ helper.deslugify(postId) ];
  return db.sqlQuery(q, params);
}

function getUserStatistics(userId) {
  var q = 'SELECT time, amount, post_id, (SELECT thread_id from posts where id = post_id), (SELECT content->>\'title\' as title FROM posts WHERE thread_id = (SELECT thread_id from posts where id = post_id) ORDER BY created_at LIMIT 1), (SELECT position FROM posts WHERE id = post_id), (SELECT username from users where id = to_user_id) FROM merit_ledger WHERE from_user_id = $1 and time >= now() - \'3 months\'::interval';
  var params = [ helper.deslugify(userId) ];
  var results = {};
  return db.sqlQuery(q, params)
  .then(function(recentlySent) {
    results.recently_sent = recentlySent;
    q = 'SELECT time, amount, post_id, (SELECT thread_id from posts where id = post_id), (SELECT content->>\'title\' as title FROM posts WHERE thread_id = (SELECT thread_id from posts where id = post_id) ORDER BY created_at LIMIT 1), (SELECT position FROM posts WHERE id = post_id), (SELECT username from users where id = from_user_id) FROM merit_ledger WHERE to_user_id = $1 and time >= now() - \'3 months\'::interval';
    return db.sqlQuery(q, params);
  })
  .then(function(recentlyReceived) {
    results.recently_received = recentlyReceived;
    return helper.slugify(results);
  });
}

module.exports = {
  withinUserMax: withinUserMax,
  withinPostMax: withinPostMax,
  send: send,
  calculateSendableMerit: calculateSendableMerit,
  get: get,
  getPostMerits: getPostMerits,
  getUserStatistics: getUserStatistics
};

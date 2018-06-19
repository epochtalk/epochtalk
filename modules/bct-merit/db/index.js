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

function send(fromUserId, toUserId, postId, amount) {
  return calculateSendableMerit(fromUserId, toUserId, postId, amount);
}

function testDateDiff() {
  return using(db.createTransaction(), function(client) {
    // get the total amount of merit for a user
    q = 'SELECT time, amount FROM merit_ledger WHERE to_user_id = $1 ORDER BY time ASC';
    params = ['af07fbbf-c696-4c0d-938b-9a61122e90c4'];
    return client.query(q, params)
    .then(function(results) {
      if (results.rows) {
        console.log(results.rows);
        function diff(first, second) {
          return results.rows[second].time - results.rows[first].time;
        };
        // milliseconds/second * seconds/minute
        // * minutes/hour * hours/day * days/month
        var oneMonth = 1000 * 60 * 60 * 24 * 30;
        if (diff(3,7) > oneMonth) {
          console.log('BIGGER THAN MONTH');
        }
        if (diff(4,7) < oneMonth) {
          console.log('SMALLER THAN MONTH');
        }
        var oneHour = 1000 * 60 * 60;
        console.log(Date.now() - results.rows[3].time);
        console.log(oneHour);
      }
    });
  });
}

testDateDiff();

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

      // get the merit sources for a user
      q = 'SELECT time, amount FROM merit_sources WHERE user_id = $1 ORDER BY time ASC';
      params = [fromUserId];
      return client.query(q, params);
    })
    .then(function(results) {
      // if there are merit sources for the user
      if (results.rows.length) {
        sources = results.rows;
        // calculate the total sent merit
        // in excess of source merit for each source merit range
        q = 'SELECT time, amount FROM merit_ledger WHERE from_user_id = $1 ORDER BY time ASC';
        params = [fromUserId];
        return client.query(q, params)
        .then(function(results) {
          var sends;
          // if there are sends
          if (results.rows.length) {
            sends = results.rows;
          }
          else {
            sends = [];
          }
          // one month time window
          // milliseconds/second * seconds/minute * minutes/hour * hours/day * days/month
          var timeWindow = 1000 * 60 * 60 * 24 * 30;

          // total excess
          var excessSent = 0;

          // loop-updateable
          var range = [];
          var rangeSum = 0;
          var sourcePos = 0;

          Promise.each(sends, function(send) {
            // if there is a next source amount and the current send's time is
            // at or after the next source amount, reset all loop-updateable
            // variables
            if (sourcePos < sources.length - 1 && send.time >= sources[sourcePos+1].time) {
              // update the source pos
              sourcePos++;
              // clear the range sum
              rangeSum = 0;
              // clear the range array
              range = [];
            }
            // if there are sends in the range and the difference between
            // current send time and oldest range time is greater than
            // the time window, clear the range until it's within the window
            while (range.length > 0 && (send.time - range[0].time > timeWindow)) {
              // remove the send from range and update range sum
              var entry = range.shift();
              rangeSum -= entry.amount;
            }
            // remaining source merit:  the source merit allocation amount
            // minus the sent merit in the range (for time window)
            var remainingSource = Math.max(sources[sourcePos].amount - rangeSum, 0);
            // accumulate excess sent:  the amount of sent merit which exeeds
            // the remaining source merit allocation
            excessSent += Math.max(send.amount - remainingSource, 0);
            // add the send to range and update range sum
            range.push(send);
            rangeSum += send.amount;
          })
          .then(function(originalArray) {
            // calculate sendable user merit
            // subtract excess sent from sendable user merit
            sendableUserMerit -= excessSent;

            // calculate sendable source merit
            // current source is the latest source
            sourcePos = sources.length - 1;
            // if there are sends in the range and the difference between
            // now and oldest range time is greater than the time window, clear
            // the range until it's within the window
            while (range.length > 0 && (Date.now() - range[0].time > timeWindow)) {
              // remove the send from range and update range sum
              var entry = range.shift();
              rangeSum -= entry.amount;
            }
            // sendable source merit:  the current source merit allocation amount
            // minus the sent merit in the range (for time window)
            sendableSourceMerit = Math.max(sources[sourcePos].amount - rangeSum, 0);
            return;
          });
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
            sendable_user_merit: Math.floor(leftoverUserMerit),
            sendable_source_merit: Math.floor(leftoverSourceMerit)
          };
        });
      }
      // We're just calculating sendable merit
      else {
        return {
          sendable_user_merit: Math.floor(sendableUserMerit),
          sendable_source_merit: Math.floor(sendableSourceMerit)
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

var postVisibleToUser = function(paramNum) {
  return `
    EXISTS (
      SELECT 1
      FROM boards b
      WHERE id = (SELECT t.board_id FROM posts p LEFT JOIN threads t ON p.thread_id = t.id WHERE p.id = post_id) AND (b.viewable_by >= $${paramNum} OR b.viewable_by IS NULL)
    )`;
};

var cleanOffLimitPosts = function(data) {
  if (data.visible === false) {
    delete data.post_id;
    delete data.position;
    delete data.thread_id;
    delete data.title;
  }
  delete data.visible;
  return data;
};

function getUserStatistics(userId, authedPriority) {
  var q = function(toUser, fromUser) {
    return `
      SELECT
        time,
        amount,
        post_id,
        ${postVisibleToUser(2)} AS visible,
        (
          SELECT thread_id
          FROM posts
          WHERE id = post_id
        ) AS thread_id,
        (
          SELECT content->>'title' AS title
          FROM posts
          WHERE thread_id = (SELECT thread_id from posts where id = post_id) ORDER BY created_at LIMIT 1
        ) AS title,
        (
          SELECT position
          FROM posts
          WHERE id = post_id
        ) AS position,
        (
          SELECT username
          FROM users
          WHERE id = ${toUser}
        ) AS username
      FROM merit_ledger
      WHERE ${fromUser} = $1 AND time >= now() - '3 months'::interval`;
  };
  var params = [ helper.deslugify(userId), authedPriority ];
  var results = {};
  return db.sqlQuery(q('to_user_id', 'from_user_id'), params)
  .map(cleanOffLimitPosts)
  .then(function(recentlySent) {
    results.recently_sent = recentlySent;
    return db.sqlQuery(q('from_user_id', 'to_user_id'), params);
  })
  .map(cleanOffLimitPosts)
  .then(function(recentlyReceived) {
    results.recently_received = recentlyReceived;
    return helper.slugify(results);
  });
}

function getStatistics(type, authedPriority) {
  type = type.toLowerCase();
  var q, promise;
  var params = [authedPriority];
  var results = { type: type };

  // Pre-defined helper functions
  var appendStats = function(stats) {
    results.stats = stats
    return results;
  };

  // Pre-defined column selectors
  var postPosition  = '(SELECT position FROM posts WHERE id = post_id) AS position';
  var fromUsername  = '(SELECT username FROM users WHERE id = from_user_id) AS from_username';
  var toUsername    = '(SELECT username FROM users WHERE id = to_user_id) AS to_username';
  var sumAmount     = 'SUM(amount) as amount';
  var threadId      = 't.id AS thread_id';
  var threadTitle   = '(SELECT content->>\'title\' AS title FROM posts WHERE thread_id = t.id ORDER BY created_at LIMIT 1) AS title';

  // Pre-defined joins
  var joinThreads   = 'JOIN threads t ON (t.id = (SELECT p.thread_id FROM posts p WHERE p.id = post_id))';
  var joinPosts     = 'JOIN posts p ON (p.id = post_id)';
  var joinToUsers   = 'JOIN users u ON (u.id = to_user_id)';
  var joinFromUsers = 'JOIN users u ON (u.id = from_user_id)';

  if (type === 'recent') {
    q = `
      SELECT time, amount, post_id, ${threadId}, ${threadTitle}, ${postPosition}, ${fromUsername}, ${toUsername}
      FROM merit_ledger ${joinThreads}
      WHERE ${postVisibleToUser(1)}
      ORDER BY TIME DESC LIMIT 500`;
    promise = db.sqlQuery(q, params).then(appendStats);
  }
  else if (type === 'top_threads') {
    q = `
      SELECT post_id, ${sumAmount}, ${threadId}, ${threadTitle}, ${postPosition}, ${toUsername}
      FROM merit_ledger ${joinThreads} ${joinPosts}
      WHERE ${postVisibleToUser(1)} AND p.created_at > now() - '1 month'::interval AND p.position = 1
      GROUP BY t.id, post_id, to_user_id, p.created_at
      ORDER BY amount DESC, p.created_at DESC limit 50`;
    promise = db.sqlQuery(q, params).then(appendStats);
  }
  else if (type === 'top_threads_all') {
    q = `
      SELECT post_id, ${sumAmount}, ${threadId}, ${threadTitle}, ${postPosition}, ${toUsername}
      FROM merit_ledger ${joinThreads} ${joinPosts}
      WHERE ${postVisibleToUser(1)} AND p.position = 1
      GROUP BY t.id, post_id, to_user_id, p.created_at
      ORDER BY amount DESC, p.created_at DESC limit 50`;
    promise = db.sqlQuery(q, params).then(appendStats);
  }
  else if (type === 'top_replies') {
    q = `
      SELECT post_id, ${sumAmount}, ${threadId}, ${threadTitle}, ${postPosition}, ${toUsername}
      FROM merit_ledger ${joinThreads} ${joinPosts}
      WHERE ${postVisibleToUser(1)} AND p.created_at > now() - '1 month'::interval AND p.position > 1
      GROUP BY t.id, post_id, to_user_id, p.created_at
      ORDER BY amount DESC, p.created_at DESC limit 50`;
    promise = db.sqlQuery(q, params).then(appendStats);
  }
  else if (type === 'top_replies_all') {
    q = `
      SELECT post_id, ${sumAmount}, ${threadId}, ${threadTitle}, ${postPosition}, ${toUsername}
      FROM merit_ledger ${joinThreads} ${joinPosts}
      WHERE ${postVisibleToUser(1)} AND p.position > 1
      GROUP BY t.id, post_id, to_user_id, p.created_at
      ORDER BY amount DESC, p.created_at DESC limit 50`;
    promise = db.sqlQuery(q, params).then(appendStats);
  }
  else if (type === 'top_users') {
    params = [];
    q = `
      SELECT ${sumAmount}, u.username AS to_username
      FROM merit_ledger ${joinToUsers}
      WHERE time > now() - '1 month'::interval
      GROUP BY u.id
      ORDER BY amount DESC limit 50`;
    promise = db.sqlQuery(q, params).then(appendStats);
  }
  else if (type === 'top_users_all') {
    params = [];
    q = `
      SELECT ${sumAmount}, u.username AS to_username
      FROM merit_ledger ${joinToUsers}
      GROUP BY u.id
      ORDER BY amount DESC limit 50`;
    promise = db.sqlQuery(q, params).then(appendStats);
  }
  else if (type === 'top_senders') {
    params = [];
    q = `
      SELECT ${sumAmount}, u.username AS from_username
      FROM merit_ledger ${joinFromUsers}
      WHERE time > now() - '1 month'::interval
      GROUP BY u.id
      ORDER BY amount DESC limit 50`;
    promise = db.sqlQuery(q, params)
    .then(appendStats)
    .then(function() {
      q = `SELECT ${sumAmount} FROM merit_ledger WHERE time > now() - '1 month'::interval`;
      return db.scalar(q)
      .then(function(data) {
        results.total_sent_merit = data.amount;
        return results;
      })
    });
  }
  else if (type === 'top_senders_all') {
    params = [];
    q = `
      SELECT ${sumAmount}, u.username AS from_username
      FROM merit_ledger ${joinFromUsers}
      GROUP BY u.id
      ORDER BY amount DESC limit 50`;
    promise = db.sqlQuery(q, params)
    .then(appendStats)
    .then(function() {
      q = `SELECT ${sumAmount} FROM merit_ledger`;
      return db.scalar(q)
      .then(function(data) {
        results.total_sent_merit = data.amount;
        return results;
      })
    });
  }
  else if (type === 'sources') {
    var joinLatestSourceRow = 'JOIN (SELECT user_id, MAX(TIME) latest_time FROM merit_sources GROUP BY user_id) m ON (m.user_id = merit_sources.user_id AND m.latest_time = time)';
    q = `
      SELECT
        (SELECT SUM(amount) FROM merit_sources ${joinLatestSourceRow}) AS total_source_merit,
        (SELECT COUNT(*) FROM merit_sources  ${joinLatestSourceRow} WHERE amount > 0) AS num_merit_sources`;
    promise = db.scalar(q)
    .then(function(data) {
      results.total_source_merit = data.total_source_merit;
      results.num_merit_sources = data.num_merit_sources;
      // Show more stats for admins
      if (authedPriority <= 1) {
        q = `
          SELECT amount, u.username as source_username
          FROM merit_sources
          ${joinLatestSourceRow}
          JOIN users u ON (u.id = merit_sources.user_id)
          ORDER BY amount DESC`;
        return db.sqlQuery(q).then(appendStats);
      }
      else { return results; }
    });
  }

  return promise.then(helper.slugify);
}

function getLatestSourceRecords() {
  var q = 'SELECT (SELECT username FROM users WHERE id = ms.user_id), ms.user_id, ms.amount, ms.time FROM merit_sources ms INNER JOIN (SELECT user_id, MAX(time) as latest FROM merit_sources GROUP BY user_id) lt on ms.user_id = lt.user_id AND ms.time = lt.latest ORDER BY ms.time DESC';
  return db.sqlQuery(q)
  .map(function(row) {
    q = 'SELECT amount, time FROM merit_sources  WHERE user_id = $1 ORDER BY time DESC OFFSET 1';
    var params = [ row.user_id ];
    return db.sqlQuery(q, params)
    .then(function(sourceHistory) {
      row.history = sourceHistory;
      return row;
    })
  });
}

function insertSource(userId, amount) {
  var q = 'INSERT INTO merit_sources(user_id, amount, time) VALUES($1, $2, now())';
  var params = [ helper.deslugify(userId), amount ];
  return db.scalar(q, params)
  .then(function() {
    return { user_id: userId, amount: amount };
  });
}

module.exports = {
  withinUserMax: withinUserMax,
  withinPostMax: withinPostMax,
  send: send,
  insertSource: insertSource,
  calculateSendableMerit: calculateSendableMerit,
  get: get,
  getPostMerits: getPostMerits,
  getUserStatistics: getUserStatistics,
  getStatistics: getStatistics,
  getLatestSourceRecords: getLatestSourceRecords
};

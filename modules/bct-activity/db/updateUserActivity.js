var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = 'SELECT created_at as registered_at, user_id, current_period_start, current_period_offset, remaining_period_activity, total_activity FROM users LEFT JOIN user_activity ON user_id = id WHERE id = $1';
  var info; // Will hold updated activity info to store back into db
  var hasPrevActivity; // boolean indicating if preexisting activity exists
  var oldActivity;
  return db.scalar(q, [userId])
  .then(function(activityInfo) {
    info = activityInfo;
    oldActivity = activityInfo.total_activity;
    // If user has a start period they have preexisting activity info
    hasPrevActivity = !!info.current_period_start;

    // User has no previous activity, populate initial activity info
    if (!hasPrevActivity) {
      info.current_period_start = new Date(activityInfo.registered_at);
      info.current_period_offset = new Date(activityInfo.registered_at);
      info.user_id = userId;
      info.remaining_period_activity = 14;
    }

    // Initiate vars for calculating period info
    var periodDays = 14;
    var periodEnd = new Date(info.current_period_start.getTime() + (periodDays * 24 * 60 * 60 * 1000));
    var now = new Date();
    var postsInPeriod = 0;

    // Check if the 2 week period has passed
    if (now > periodEnd) {
      info.current_period_start = now;
      info.current_period_offset = now;
      info.remaining_period_activity = periodDays; // 1 point per day

      // Update Period End for the query below
      periodEnd = new Date(info.current_period_start.getTime() + (periodDays * 24 * 60 * 60 * 1000));
      // Takes into account current post
      postsInPeriod = 1;
    }
    // No activity remaining in this 2 week period
    if (info.remaining_period_activity <= 0) { return; }
    // Add post count between offset and period end to total activity
    else {
      q = 'SELECT COUNT(id) FROM posts WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3';
      return db.scalar(q, [userId, info.current_period_offset, periodEnd])
      .then(function(postInfo) { postsInPeriod = postsInPeriod === 0 ? postInfo.count : postsInPeriod; })
      .then(function() {
        // There are more posts than activity remaining
        if (postsInPeriod >= info.remaining_period_activity) {
          info.total_activity = Number(info.total_activity) + Number(info.remaining_period_activity);
          info.remaining_period_activity = 0;
        }
        // There is still activity remaining
        else {
          info.total_activity = Number(info.total_activity) + Number(postsInPeriod);
          info.remaining_period_activity = Number(info.remaining_period_activity) - Number(postsInPeriod);
        }
      })
      // Update activity in db
      .then(function() {
        var q = 'INSERT INTO user_activity (user_id, current_period_start, current_period_offset, remaining_period_activity, total_activity) VALUES ($1, $2, now(), $3, $4)';
        var params = [info.user_id, info.current_period_start, info.remaining_period_activity, info.total_activity];
        if (hasPrevActivity) {
          q = 'UPDATE user_activity SET current_period_start = $2, current_period_offset = now(), remaining_period_activity = $3, total_activity = $4 WHERE user_id = $1';
        }
        return db.sqlQuery(q, params);
      })
      .then(function() {
        var activity = {
          old_activity: oldActivity,
          updated_activity: info.total_activity
        };
        return activity;
      });
    }
  });
};

/*
// checks
  1) Is current_period_start null, if so populate current_period_start and current_period_offset with user registration date

  2) check if current date is past (current_period_start + 14) if so update current_period_start and remaining_period_activity set to 14 and set current_period_offset to match start

  3) query remaining_period_activity if 0 then return else move to step 4

//algorithm
  4) current_period_offset - (current_period_start + 14 days) postsFound = (Query posts between this time for user)

  5) if (postsFound >= remaining_period_activity) {
       total_activity += remaining_period_activity;
       remaining_period_activity = 0;
     }
    else {
      total_activity += postsFound;
      remaining_period_activity = remaining_period_activity - postsFound;
    }

  7) update total_activity, remaining_period_activity current_period_offset
*/

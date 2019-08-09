var common = {};
module.exports = common;

var uuid = require('uuid/v4');

var formatThread = function(thread, userId) {
  // handle deleted user
  if (thread.user_deleted) {
    thread.user_id = '';
    thread.username = '';
  }

  // format user output
  thread.user = {
    id: thread.user_id,
    username: thread.username,
    deleted: thread.user_deleted
  };
  delete thread.user_id;
  delete thread.username;
  delete thread.user_deleted;

  // format last
  if (userId && !thread.last_viewed) {
    thread.has_new_post = true;
    thread.latest_unread_position = 1;
  }
  else if (userId && userId !== thread.last_post_user_id && thread.last_viewed <= thread.last_post_created_at) {
    thread.has_new_post = true;
    thread.latest_unread_position = thread.post_position;
    thread.latest_unread_post_id = thread.post_id;
  }
  delete thread.post_id;
  delete thread.post_position;
  delete thread.last_viewed;

  // handle last post formatting
  if (thread.last_post_deleted || thread.last_post_user_deleted) {
    thread.last_deleted = true;
    delete thread.last_post_username;
  }
  delete thread.last_post_deleted;
  delete thread.last_post_user_deleted;
  delete thread.last_post_user_id;
  return thread;
};

// Documentation for future reference:
// This code was not documented, but from fixing the thread
// views this is my understanding of what this method does.
//
// First check, checks if there is a viewerId to thread ID match in redis
//
// If valid and the user has viewed the thread in the last hour,
// then they are in a cooloff period where the view count does not increment
//
// If valid and the user has not viewed the thread in the last hour then their
// visit counts as a new view.
//
// Otherwise the key did not exist, so check if a user from their ip has visited the thread
// by checking redis for the key IP + threadId
//
// Repeat the same steps as above, check validity and cooldown period and increment accordingly.
//
// Everytime a key is validated, it re-enters cooldown for another hour
//
// The steps above prevents users from bumping their view count using either their same
// account or alt account, since we are checking IP as well.
function checkView(server, headers, info, threadId) {
  var viewerId = headers['epoch-viewer'];
  var newViewerId = '';

  // Check if viewerId and threadId is found
  var viewerIdKey = viewerId + threadId;
  var promise = checkViewKey(viewerIdKey, server.redis)
  .then(function(data) {
    // Do nothing if user has viewed the thread in the past hour
    if (data.valid && data.cooloff) { return; }
    // If the key is valid and not in the one hour cooloff period increment view count
    else if (data.valid && !data.cooloff) { return server.db.threads.incViewCount(threadId); }
    // viewId not found, create one for this user/thread combo
    else {
      var redisPromise;
      // save this viewerId to redis
      if (viewerId) {
        redisPromise = server.redis.setAsync(viewerIdKey, Date.now());
      }
      // create new viewerId and save to redis
      else {
        newViewerId = uuid();
        redisPromise = server.redis.setAsync(newViewerId + threadId, Date.now());
      }

      // Check if ip address and threadId is found
      var viewerAddress = info.remoteAddress;
      var addressKey = viewerAddress + threadId;
      return redisPromise
      .then(function() {
        return checkViewKey(addressKey, server.redis);
      })
      .then(function(data) { // address found
        // Cooloff, user has viewed thread in last hour, do not increment
        if (data.valid && data.cooloff) { return; }
        // Key is valid, and not in cooloff, increment thread view count
        else if (data.valid && !data.cooloff) { return server.db.threads.incViewCount(threadId); }
        // Key does not exist
        else {
          // save this address + threadId combo to redis
          return server.redis.setAsync(addressKey, Date.now())
          .then(function() {
            // increment view count
            return server.db.threads.incViewCount(threadId);
          });
        }
      });
    }
  })
  .then(function() { return newViewerId; });

  return promise;
}

function updateView(server, auth, threadId) {
  var promise = true;
  if (auth.isAuthenticated) {
    var userId = auth.credentials.id;
    promise = server.db.users.putUserThreadViews(userId, threadId);
  }
  return promise;
}

// private methods

function checkViewKey(key, redis) {
  return redis.getAsync(key)
  .then(function(storedTime) {
    var returnPromise;
    if (storedTime) {
      var timeElapsed = Date.now() - storedTime;
      // key exists and is past the cooling period
      // update key with new value and return true
      var oneHour = 1000 * 60 * 60;
      if (timeElapsed > oneHour) {
        returnPromise = redis.setAsync(key, Date.now())
        .then(function() { return { valid: true, cooloff: false }; });
      }
      // User is in cooloff period, wait an hour before before cooloff ends
      else { return { valid: true, cooloff: true }; }
    }
    // Key was not found, key is invalid
    else { return { valid: false }; }
    return returnPromise;
  });
}

common.formatThread = formatThread;

common.export = () =>  {
  return [
    {
      name: 'common.threads.checkView',
      method: checkView
    },
    {
      name: 'common.threads.updateView',
      method: updateView
    }
  ];
};

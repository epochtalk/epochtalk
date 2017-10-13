var common = {};
module.exports = common;

var uuid = require('uuid');

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

function checkView(server, headers, info, threadId) {
  var viewerId = headers['epoch-viewer'];
  var newViewerId = '';

  // Check if viewerId and threadId is found
  var viewerIdKey = viewerId + threadId;
  var promise = checkViewKey(viewerIdKey, server.redis)
  .then(function(valid) { // viewId found
    if (valid) { return server.db.threads.incViewCount(threadId); }
  })
  .catch(function() { // viewId not found
    // save this viewerId to redis
    if (viewerId) { server.redis.setAsync(viewerIdKey, Date.now()); }
    // create new viewerId and save to redis
    else {
      newViewerId = uuid.v4();
      server.redis.setAsync(newViewerId + threadId, Date.now());
    }

    // Check if ip address and threadId is found
    var viewerAddress = info.remoteAddress;
    var addressKey = viewerAddress + threadId;
    return checkViewKey(addressKey, server.redis)
    .then(function(valid) { // address found
      if (valid) { return server.db.threads.incViewCount(threadId); }
    })
    .catch(function() { // address not found
      // save this address + threadId combo to redis
      server.redis.setAsync(addressKey, Date.now());
      // increment view count
      return server.db.threads.incViewCount(threadId);
    });
  })
  .then(function() { return newViewerId; });

  return promise;
}

function updateView(server, auth, threadId) {
  var promise;
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
      if (timeElapsed > 1000 * 60) {
        returnPromise = redis.setAsync(key, Date.now())
        .then(function() { return true; });
      }
    }
    return returnPromise;
  });
}

common.formatThread = formatThread;

common.export = () =>  {
  return [
    {
      name: 'common.threads.checkView',
      method: checkView,
      options: { callback: false }
    },
    {
      name: 'common.threads.updateView',
      method: updateView,
      options: { callback: false }
    }
  ];
};

var path = require('path');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));
var uuid = require('node-uuid');
var memDb = require(path.join('..', '..', 'memstore')).db;
var config = require(path.join(__dirname, '..', '..', '..', 'config'));

// Helpers
var checkViewKey = function(key) {
  return memDb.getAsync(key)
  .then(function(storedTime) {
    var timeElapsed = Date.now() - storedTime;
    // key exists and is past the cooling period
    // update key with new value and return true
    if (timeElapsed > 1000 * 60) {
      return memDb.putAsync(key, Date.now())
      .then(function() { return true; });
    }
    // key exists but before cooling period
    // do nothing and return false
    else { return false; }
  });
};

// Pre
module.exports = {
  getThreads: function(request, reply) {
    var boardId = request.query.board_id || request.params.board_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };

    db.threads.byBoard(boardId, opts)
    .then(function(threads) { return reply(threads); })
    .catch(function(err) { return reply(err.message); });
  },
  getThread: function(request, reply) {
    var threadId = request.params.id || request.query.id;
    db.threads.find(threadId)
    .then(function(thread) { return reply(thread); })
    .catch(function(err) { return reply(err); });
  },
  checkViewValidity: function(request, reply) {
    var threadId = request.params.id || request.query.id;
    var viewerId = request.headers['epoch-viewer'];
    var viewerAddress = request.info.remoteAddress;
    var newViewerId;

    if (viewerId) { // viewerId was sent back so try that
      var viewerIdKey = viewerId + threadId;
      return checkViewKey(viewerIdKey)
      .then(function(valid) { // viewId found
        if (valid) { db.threads.incViewCount(threadId); }
        return reply(undefined);
      })
      .catch(function() { // viewId not found
        memDb.putAsync(viewerIdKey, Date.now()); // save to memdb
        var addressKey = viewerAddress + threadId;
        return checkViewKey(addressKey)
        .then(function(valid) { // address found
          if (valid) { db.threads.incViewCount(threadId); }
          return reply(undefined);
        })
        // address doesn't exists so inc is valid
        .catch(function() {
          memDb.putAsync(addressKey, Date.now());
          db.threads.incViewCount(threadId);
          return reply(undefined);
        });
      });
    } // no viewerId, check IP
    else {
      newViewerId = uuid.v4(); // generate new viewerId
      memDb.putAsync(newViewerId + threadId, Date.now()); // save to mem db
      var addressKey = viewerAddress + threadId;
      return checkViewKey(addressKey)
      .then(function(valid) {
        if (valid) { db.threads.incViewCount(threadId); }
        return reply(newViewerId);
      })
      // address doesn't exists so inc is valid
      .catch(function() {
        memDb.putAsync(addressKey, Date.now());
        db.threads.incViewCount(threadId);
        return reply(newViewerId);
      });
    }
  },
  getUserThreadViews: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(undefined); }

    var user = request.auth.credentials;
    db.users.getUserThreadViews(user.id)
    .then(function(userViews) { return reply(userViews); })
    .catch(function() { return reply({}); });
  },
  updateUserThreadViews: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(); }

    var threadId = request.params.id || request.query.id;
    var now = Date.now();
    var user = request.auth.credentials;
    var newThreadViews = [ { threadId: threadId, timestamp: now } ];
    db.users.putUserThreadViews(user.id, newThreadViews)
    .then(function() { return reply(); })
    .catch(function(err) { return reply(err); });
  }
};

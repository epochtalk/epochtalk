var path = require('path');
var uuid = require('node-uuid');
var core = require('epochcore')();
var memDb = require(path.join('..', '..', '..', 'memStore')).db;

module.exports = {
  getThreads: function(request, reply) {
    var boardId = request.query.board_id || request.params.board_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };

    core.threads.byBoard(boardId, opts)
    .then(function(threads) { return reply(threads); })
    .catch(function(err) { return reply(err.message); });
  },
  getThread: function(request, reply) {
    var threadId = request.params.id || request.query.id;
    core.threads.find(threadId)
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
        if (valid) { core.threads.incViewCount(threadId); }
        return reply(undefined);
      })
      .catch(function(err) { // viewId not found
        memDb.putAsync(viewerIdKey, Date.now()); // save to memdb
        var addressKey = viewerAddress + threadId;
        return checkViewKey(addressKey)
        .then(function(valid) { // address found
          if (valid) { core.threads.incViewCount(threadId); }
          return reply(undefined);
        })
        // address doesn't exists so inc is valid
        .catch(function() {
          memDb.putAsync(addressKey, Date.now());
          core.threads.incViewCount(threadId);
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
        if (valid) { core.threads.incViewCount(threadId); }
        return reply(newViewerId);
      })
      // address doesn't exists so inc is valid
      .catch(function(err) {
        memDb.putAsync(addressKey, Date.now());
        core.threads.incViewCount(threadId);
        return reply(newViewerId);
      });
    }
  },
  getUserViews: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(undefined); }

    var user = request.auth.credentials;
    core.users.getUserViews(user.id)
    .then(function(userViews) { return reply(userViews); });
  },
  updateUserView: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(); }
    
    var threadId = request.params.id || request.query.id;
    var now = Date.now();
    var user = request.auth.credentials;
    var newUserViews = [ { threadId: threadId, timestamp: now } ];
    core.users.putUserViews(user.id, newUserViews)
    .then(function() { return reply(); })
    .catch(function(err) { return reply(err); });
  }
};

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

var _ = require('lodash');
var path = require('path');
var uuid = require('node-uuid');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));
var redis = require(path.normalize(__dirname + '/../../../redis'));
var commonPre = require(path.normalize(__dirname + '/../common')).auth;
var Boom = require('boom');

module.exports = {
  accessBoardWithThreadId: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var boardVisible = db.threads.getThreadsBoardInBoardMapping(threadId)
    .then(function(board) { return !!board; });

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');

    var promise = Promise.join(boardVisible, viewSome, viewAll, function(visible, some, all) {
      var result = Boom.notFound();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (request.auth.isAuthenticated && some) {
        result = isModWithThreadId(request.auth.credentials.id, threadId);
      }
      return result;
    });
    return reply(promise);
  },
  accessBoardWithBoardId: function(request, reply) {
    var boardId = _.get(request, request.route.settings.app.board_id);
    var boardVisible = db.boards.getBoardInBoardMapping(boardId)
    .then(function(board) { return !!board; });

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');

    var promise = Promise.join(boardVisible, viewSome, viewAll, function(visible, some, all) {
      var result = Boom.notFound();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (request.auth.isAuthenticated && some) {
        result = isModWithBoardId(request.auth.credentials.id, boardId);
      }
      return result;
    });
    return reply(promise);
  },
  isRequesterActive: function(request, reply) {
    var promise = Boom.unauthorized();
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) {
      var username = request.auth.credentials.username;
      username = querystring.unescape(username);
      promise = db.users.userByUsername(username)
      .then(function(user) {
        var active = Boom.forbidden();
        if (user) { active = !user.deleted; }
        return active;
      });
    }
    return reply(promise);
  },
  isThreadEditable: function(request, reply) {
    var userId = request.auth.credentials.id;
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var getACLValue = request.server.plugins.acls.getACLValue;

    // get thread ownership
    var isThreadOwner = db.threads.getThreadOwner(threadId)
    .then(function(owner) { return owner.user_id === userId; });

    // check if user is mod
    var isMod = isModWithThreadId(userId, threadId);

    // get user's permisions
    var lockSome = getACLValue(request.auth, 'threads.privilegedUpdate.some');
    var lockAll = getACLValue(request.auth, 'threads.privilegedUpdate.all');

    var promise = Promise.join(isThreadOwner, isMod, lockSome, lockAll, function(owner, mod, some, all) {
      var result = Boom.forbidden();
      if (all || isThreadOwner) { result = true; }
      else if (some && mod) { result = true; }
      return result;
    });

    return reply(promise);
  },
  isThreadLockable: function(request, reply) {
    var userId = request.auth.credentials.id;
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var getACLValue = request.server.plugins.acls.getACLValue;

    // get thread ownership
    var isThreadOwner = db.threads.getThreadOwner(threadId)
    .then(function(owner) { return owner.user_id === userId; });

    // check if user is mod
    var isMod = isModWithThreadId(userId, threadId);

    // get user's permisions
    var lockSome = getACLValue(request.auth, 'threads.privilegedLock.some');
    var lockAll = getACLValue(request.auth, 'threads.privilegedLock.all');

    var promise = Promise.join(isThreadOwner, isMod, lockSome, lockAll, function(owner, mod, some, all) {
      var result = Boom.forbidden();
      if (all || isThreadOwner) { result = true; }
      else if (some && mod) { result = true; }
      return result;
    });

    return reply(promise);
  },
  getThread: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    db.threads.find(threadId)
    .then(function(thread) { return reply(thread); })
    .catch(function(err) { return reply(err); });
  },
  checkViewValidity: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
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
        redis.setAsync(viewerIdKey, Date.now()); // save to redis
        var addressKey = viewerAddress + threadId;
        return checkViewKey(addressKey)
        .then(function(valid) { // address found
          if (valid) { db.threads.incViewCount(threadId); }
          return reply(undefined);
        })
        // address doesn't exists so inc is valid
        .catch(function() {
          redis.setAsync(addressKey, Date.now());
          db.threads.incViewCount(threadId);
          return reply(undefined);
        });
      });
    } // no viewerId, check IP
    else {
      newViewerId = uuid.v4(); // generate new viewerId
      redis.setAsync(newViewerId + threadId, Date.now());
      var addressKey = viewerAddress + threadId;
      return checkViewKey(addressKey)
      .then(function(valid) {
        if (valid) { db.threads.incViewCount(threadId); }
        return reply(newViewerId);
      })
      // address doesn't exists so inc is valid
      .catch(function() {
        redis.setAsync(addressKey, Date.now());
        db.threads.incViewCount(threadId);
        return reply(newViewerId);
      });
    }
  },
  updateUserThreadViews: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(); }

    var threadId = _.get(request, request.route.settings.app.thread_id);
    var now = Date.now();
    var userId = request.auth.credentials.id;
    var newThreadViews = [ { threadId: threadId, timestamp: now } ];
    db.users.putUserThreadViews(userId, newThreadViews)
    .then(function() { return reply(); })
    .catch(function(err) { return reply(err); });
  },
  threadFirstPost: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var promise = db.threads.getThreadFirstPost(threadId)
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  }
};

function isModWithBoardId(userId, boardId) {
  // TODO: Implement check against board_moderators
  return true;
}

function isModWithThreadId(userId, threadId) {
  // TODO: Implement check against board_moderators
  return true;
}

function checkViewKey(key) {
  return redis.getAsync(key)
  .then(function(storedTime) {
    var timeElapsed = Date.now() - storedTime;
    // key exists and is past the cooling period
    // update key with new value and return true
    if (timeElapsed > 1000 * 60) {
      return redis.setAsync(key, Date.now())
      .then(function() { return true; });
    }
    // key exists but before cooling period
    // do nothing and return false
    else { return false; }
  });
}

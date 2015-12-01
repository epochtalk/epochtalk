var _ = require('lodash');
var Boom = require('boom');
var path = require('path');
var uuid = require('node-uuid');
var Promise = require('bluebird');
var db = require(path.normalize(__dirname + '/../../../db'));
var redis = require(path.normalize(__dirname + '/../../../redis'));

module.exports = {
  accessBoardWithThreadId: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var threadId = _.get(request, request.route.settings.app.thread_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, threadId);
    var boardVisible = db.threads.getThreadsBoardInBoardMapping(threadId)
    .then(function(board) { return !!board; });

    var promise = Promise.join(boardVisible, viewAll, viewSome, isMod, function(visible, all, some, mod) {
      var result = Boom.notFound();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (some && mod) { result = true; }
      return result;
    });
    return reply(promise);
  },
  accessBoardWithBoardId: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var boardId = _.get(request, request.route.settings.app.board_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, boardId);
    var boardVisible = db.boards.getBoardInBoardMapping(boardId)
    .then(function(board) { return !!board; });

    var promise = Promise.join(boardVisible, viewAll, viewSome, isMod, function(visible, all, some, mod) {
      var result = Boom.notFound();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (some && mod) { result = true; }
      return result;
    });
    return reply(promise);
  },
  isRequesterActive: function(request, reply) {
    var promise = Boom.unauthorized();
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) {
      var userId = request.auth.credentials.id;
      promise = db.users.find(userId)
      .then(function(user) {
        var active = Boom.forbidden('User Account Not Active');
        if (user && !user.deleted) { active = true; }
        return active;
      });
    }
    return reply(promise);
  },
  isThreadOwner: function(request, reply) {
    var userId = request.auth.credentials.id;
    var privilege = request.route.settings.app.isThreadOwner;
    var threadId = _.get(request, request.route.settings.app.thread_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var privilegedAll = getACLValue(request.auth, privilege + '.all');
    var privilegedSome = getACLValue(request.auth, privilege +'.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, threadId);
    var isThreadOwner = db.threads.getThreadOwner(threadId)
    .then(function(owner) { return owner.user_id === userId; });

    var promise = Promise.join(isThreadOwner, privilegedAll, privilegedSome, isMod, function(owner, all, some, mod) {
      var result = Boom.forbidden();
      if (owner || all) { result = true; }
      else if (some && mod) { result = true; }
      return result;
    });

    return reply(promise);
  },
  hasPermission: function(request, reply) {
    var userId = request.auth.credentials.id;
    var privilege = request.route.settings.app.hasPermission;
    var threadId = _.get(request, request.route.settings.app.thread_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var privilegedAll = getACLValue(request.auth, privilege + '.all');
    var privilegedSome = getACLValue(request.auth, privilege +'.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, threadId);
    var promise = Promise.join(privilegedAll, privilegedSome, isMod, function(all, some, mod) {

      var result = Boom.forbidden();
      if (all) { result = true; }
      else if (some && mod) { result = true; }
      return result;
    });

    return reply(promise);
  },
  pollExists: function(request, reply) {
    // Check if has poll exists
    var threadId = _.get(request, request.route.settings.app.thread_id);
    promise = db.polls.exists(threadId)
    .then(function(exists) {
      var pollExists = Boom.badRequest('Poll Does Not Exists');
      if (exists) { pollExists = exists; }
      return pollExists;
    });

    return reply(promise);
  },
  isPollOwner: function(request, reply) {
    var userId = request.auth.credentials.id;
    var privilege = request.route.settings.app.isPollOwner;
    var threadId = _.get(request, request.route.settings.app.thread_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var privilegedAll = getACLValue(request.auth, privilege + '.all');
    var privilegedSome = getACLValue(request.auth, privilege +'.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, threadId);
    var isThreadOwner = db.threads.getThreadOwner(threadId)
    .then(function(owner) { return owner.user_id === userId; });

    var promise = Promise.join(isThreadOwner, privilegedAll, privilegedSome, isMod, function(owner, all, some, mod) {
      var result = Boom.forbidden();
      if (owner || all) { result = true; }
      else if (some && mod) { result = true; }
      return result;
    });

    return reply(promise);
  },
  isPollCreatable: function(request, reply) {
    var poll = request.payload.poll;

    if (!poll) { return reply(); }

    var privilege = request.route.settings.app.isPollCreatable;
    var getACLValue = request.server.plugins.acls.getACLValue;
    var canCreate = getACLValue(request.auth, privilege);

    var result = Boom.forbidden();
    if (canCreate) { result = true; }
    return reply(result);
  },
  canVote: function(request, reply) {
    // Check if has voted already
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var userId = request.auth.credentials.id;
    promise = db.polls.hasVoted(threadId, userId)
    .then(function(voted) {
      var canVote = Boom.badRequest('Already Voted');
      if (!voted) { canVote = true; }
      return canVote;
    });

    return reply(promise);
  },
  isPollUnlocked: function(request, reply) {
    // Check if has poll is unlocked
    var pollId = _.get(request, request.route.settings.app.poll_id);
    promise = db.polls.isLocked(pollId)
    .then(function(locked) {
      var canLock = Boom.badRequest('Poll is Unlocked');
      if (!locked) { canLock = true; }
      return canLock;
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
    var newViewerId = '';

    // Check if viewerId and threadId is found
    var viewerIdKey = viewerId + threadId;
    var promise = checkViewKey(viewerIdKey)
    .then(function(valid) { // viewId found
      if (valid) { return db.threads.incViewCount(threadId); }
    })
    .catch(function() { // viewId not found
      // save this viewerId to redis
      if (viewerId) { redis.setAsync(viewerIdKey, Date.now()); }
      // create new viewerId and save to redis
      else {
        newViewerId = uuid.v4();
        redis.setAsync(newViewerId + threadId, Date.now());
      }

      // Check if ip address and threadId is found
      var viewerAddress = request.info.remoteAddress;
      var addressKey = viewerAddress + threadId;
      return checkViewKey(addressKey)
      .then(function(valid) { // address found
        if (valid) { return db.threads.incViewCount(threadId); }
      })
      .catch(function() { // address not found
        // save this address + threadId combo to redis
        redis.setAsync(addressKey, Date.now());
        // increment view count
        return db.threads.incViewCount(threadId);
      });
    })
    .then(function() { return newViewerId; });

    return reply(promise);
  },
  updateUserThreadViews: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(); }

    var threadId = _.get(request, request.route.settings.app.thread_id);
    var userId = request.auth.credentials.id;
    var promise = db.users.putUserThreadViews(userId, threadId);
    return reply(promise);
  },
  threadFirstPost: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var promise = db.threads.getThreadFirstPost(threadId)
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  }
};

function checkViewKey(key) {
  return redis.getAsync(key)
  .then(function(storedTime) {
    if (storedTime) { return storedTime; }
    else { return Promise.reject(); } // value is null
  })
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

var _ = require('lodash');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var querystring = require('querystring');

// -- Fact functions --

function getUserId(request) {
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { return request.auth.credentials.id; }
  else { return; }
}

function getUsername(request) {
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { return request.auth.credentials.username; }
  else { return; }
}

function hasPermission(request, permission) {
  var getACLValue = request.server.plugins.acls.getACLValue;
  return getACLValue(request.auth, permission);
}

function getPriority(request) {
  var getUserPriority = request.server.plugins.acls.getUserPriority;
  return getUserPriority(request.auth);
}

function checkAuth(conditions, error) {
  var authed = error;
  return Promise.map(conditions, function(result) {
    if (result) { authed = true; }
  })
  .then(function() { return authed; });
}

// -- discrete conditions

function isBoardVisible(request) {
  var priority = getPriority(request);
  var boardId = _.get(request, request.route.settings.app.board_id);
  return request.db.boards.getBoardInBoardMapping(boardId, priority);
}

function isBoardVisibleThreadId(request) {
  var priority = getPriority(request);
  var threadId = _.get(request, request.route.settings.app.thread_id);
  return request.db.threads.getThreadsBoardInBoardMapping(threadId, priority);
}

function isModAndPermission(request, permission) {
  var userId = getUserId(request);
  var some = hasPermission(request, permission);
  var boardId = _.get(request, request.route.settings.app.board_id);
  return request.db.moderators.isModerator(userId, boardId)
  .then(function(mod) { return mod && some; });
}

function isModAndPermissionThreadId(request, permission) {
  var userId = getUserId(request);
  var some = hasPermission(request, permission);
  var threadId = _.get(request, request.route.settings.app.thread_id);
  return request.db.moderators.isModeratorWithThreadId(userId, threadId)
  .then(function(mod) { return mod && some; });
}

function isUserActive(request, username) {
  var userId = getUserId(request);
  return request.db.users.userByUsername(username)
  .then(function(user) {
    var active = false;
    if (user && user.id === userId) { active = true; }
    else if (user) { active = !user.deleted; }
    return active;
  });
}

// -- Authorization API

module.exports = {
  // -- Common
  isRequesterActive: function(request, reply) {
    var promise = Boom.unauthorized();
    if (request.auth.isAuthenticated) {
      promise = request.db.users.find(request.auth.credentials.id)
      .then(function(user) {
        var active = Boom.forbidden('User Account Not Active');
        if (user && !user.deleted) { active = true; }
        return active;
      });
    }
    return reply(promise);
  },
  userPriority: function(request, reply) {
    return reply(getPriority(request));
  },
  // -- Auth
  checkUniqueEmail: function(request, reply) {
    var email = request.payload.email;
    var promise = request.db.users.userByEmail(email)
    .then(function(user) {
      var result = true;
      if (user) { result = Boom.badRequest('Email Already Exists'); }
      return result;
    });
    return reply(promise);
  },
  checkUniqueUsername: function(request, reply) {
    var username = request.payload.username;
    var promise = request.db.users.userByUsername(username)
    .then(function(user) {
      var result = true;
      if (user) { result = Boom.badRequest('Username Already Exists'); }
      return result;
    });
    return reply(promise);
  },
  // -- Boards
  accessBoardWithBoardId: function(request, reply) {
    var conditions = [
      isBoardVisible(request),
      hasPermission(request, 'boards.viewUncategorized.all'),
      isModAndPermission(request, 'boards.viewUncategorized.some')
    ];
    return reply(checkAuth(conditions, Boom.notFound('Error Code: ABWBI')));
  },
  accessBoardWithThreadId: function(request, reply) {
    var conditions = [
      isBoardVisibleThreadId(request),
      hasPermission(request, 'boards.viewUncategorized.all'),
      isModAndPermissionThreadId(request, 'boards.viewUncategorized.some')
    ];
    return reply(checkAuth(conditions, Boom.notFound('Error Code: ABWTI')));
  },
  // -- Threads
  isThreadOwner: function(request, reply) {
    var userId = request.auth.credentials.id;
    var privilege = request.route.settings.app.isThreadOwner;
    var threadId = _.get(request, request.route.settings.app.thread_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var privilegedAll = getACLValue(request.auth, privilege + '.all');
    var privilegedSome = getACLValue(request.auth, privilege +'.some');
    var isMod = request.db.moderators.isModeratorWithThreadId(userId, threadId);
    var isThreadOwner = request.db.threads.getThreadOwner(threadId)
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
    var isMod = request.db.moderators.isModeratorWithThreadId(userId, threadId);
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
    var promise = request.db.polls.exists(threadId)
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
    var isMod = request.db.moderators.isModeratorWithThreadId(userId, threadId);
    var isThreadOwner = request.db.threads.getThreadOwner(threadId)
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
  canCreatePoll: function(request,reply) {
    var threadId = request.params.threadId;
    var userId = request.auth.credentials.id;

    // make sure thread exists
    // make sure user is thread owner
    var getThreadOwner = request.db.threads.getThreadOwner(threadId);
    // make sure poll doesn't exist
    var getPollExists = request.db.polls.exists(threadId);

    var promise = Promise.join(getThreadOwner, getPollExists, function(owner, exists) {
      var result = Boom.forbidden();
      if (exists) { result = Boom.badRequest('Poll already exists'); }
      else if (owner.user_id === userId) { result = true; }
      return result;
    });

    return reply(promise);
  },
  validateMaxAnswers: function(request, reply) {
    var poll = _.get(request, request.route.settings.app.poll);
    if (!poll) { return reply(); }

    var maxAnswers = poll.max_answers;
    var answersLength = poll.answers.length;
    if (maxAnswers > answersLength) { poll.max_answers = answersLength; }
    return reply();
  },
  validateDisplayMode: function(request, reply) {
    var poll = _.get(request, request.route.settings.app.poll);
    if (!poll) { return reply(); }

    var error;
    if (poll.display_mode === 'expired' && !poll.expiration) {
      error = Boom.badRequest('Showing results after expiration requires an expiration');
    }

    return reply(error);
  },
  validateMaxAnswersUpdate: function(request, reply) {
    var pollId = request.params.pollId;
    var maxAnswers = request.payload.max_answers;
    var promise = request.db.polls.answers(pollId)
    .then(function(answers) {
      var answersLength = answers.length;
      if (maxAnswers > answersLength) { request.payload.max_answers = answersLength; }
    });
    return reply(promise);
  },
  canVote: function(request, reply) {
    // Check if has voted already
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var userId = request.auth.credentials.id;
    var promise = request.db.polls.hasVoted(threadId, userId)
    .then(function(voted) {
      var canVote = Boom.badRequest('Already Voted');
      if (!voted) { canVote = true; }
      return canVote;
    });

    return reply(promise);
  },
  isPollUnlocked: function(request, reply) {
    var pollId = _.get(request, request.route.settings.app.poll_id);
    var promise = request.db.polls.isLocked(pollId)
    .then(function(locked) {
      var canLock = Boom.badRequest('Poll is Unlocked');
      if (!locked) { canLock = true; }
      return canLock;
    });

    return reply(promise);
  },
  isPollRunning: function(request, reply) {
    var pollId = _.get(request, request.route.settings.app.poll_id);
    var promise = request.db.polls.isRunning(pollId)
    .then(function(running) {
      var canVote = Boom.badRequest('Poll is Expired');
      if (running) { canVote = true; }
      return canVote;
    });

    return reply(promise);
  },
  isVoteValid: function(request, reply) {
    var pollId = _.get(request, request.route.settings.app.poll_id);
    var payloadLength = request.payload.answerIds.length;

    var promise = request.db.polls.maxAnswers(pollId)
    .then(function(maxAnswers) {
      var canVote = Boom.badRequest('Too Many Answers');
      if (maxAnswers && maxAnswers >= payloadLength) { canVote = true; }
      return canVote;
    });

    return reply(promise);
  },
  canChangeVote: function(request, reply) {
    var pollId = _.get(request, request.route.settings.app.poll_id);
    var promise = request.db.polls.changeVote(pollId)
    .then(function(changeVote) {
      var canChange = Boom.badRequest('Votes cannot be changed');
      if (changeVote) { canChange = true; }
      return canChange;
    });

    return reply(promise);
  },
  canModerate: function(request, reply) {
    if (!request.payload.moderated) { return reply(); }

    var getACLValue = request.server.plugins.acls.getACLValue;
    var hasPrivilege = getACLValue(request.auth, 'threads.moderated');
    var result = Boom.forbidden();
    if (hasPrivilege) { result = true; }

    return reply(result);
  },
  threadFirstPost: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var promise = request.db.threads.getThreadFirstPost(threadId)
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  },
  // -- Posts
  canViewDeletedPost: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var postId = _.get(request, request.route.settings.app.post_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'posts.viewDeleted.all');
    var viewSome = getACLValue(request.auth, 'posts.viewDeleted.some');
    var isMod = request.db.moderators.isModeratorWithPostId(userId, postId);

    var promise = Promise.join(viewAll, viewSome, isMod, function(all, some, mod) {
      var result = false;
      if (all) { result = true; }
      else if (some && mod) { result = true; }
      return result;
    });
    return reply(promise);
  },
  canViewDeletedPosts: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'posts.viewDeleted.all');
    var viewSome = getACLValue(request.auth, 'posts.viewDeleted.some');
    var modBoards = request.db.moderators.getUsersBoards(userId);

    var promise = Promise.join(viewAll, viewSome, modBoards, function(all, some, boards) {
      var result = false;
      if (all) { result = true; }
      else if (some && boards.length > 0) { result = boards; }
      return result;
    });
    return reply(promise);
  },
  isPostPurgeable: function(request, reply) {
    var userId = request.auth.credentials.id;
    var postId = _.get(request, request.route.settings.app.post_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var purgeAll = getACLValue(request.auth, 'posts.privilegedPurge.all');
    var purgeSome = getACLValue(request.auth, 'posts.privilegedPurge.some');
    var isMod = request.db.moderators.isModeratorWithPostId(userId, postId);

    var promise = Promise.join(purgeAll, purgeSome, isMod, function(all, some, mod) {
      var result = false;
      if (all) { result = true; }
      else if (some && mod) { result = true; }
      return result;
    });
    return reply(promise);
  },
  accessBoardWithPostId: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var postId = _.get(request, request.route.settings.app.post_id);

    var getUserPriority = request.server.plugins.acls.getUserPriority;
    var priority = getUserPriority(request.auth);
    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var isMod = request.db.moderators.isModeratorWithPostId(userId, postId);
    var boardVisible = request.db.posts.getPostsBoardInBoardMapping(postId, priority);

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
  accessLockedThreadWithPostId: function(request, reply) {
    var postId = _.get(request, request.route.settings.app.post_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var bypassAll = getACLValue(request.auth, 'posts.bypassLock.all');
    var bypassSome = getACLValue(request.auth, 'posts.bypassLock.some');
    var isMod = request.db.moderators.isModeratorWithPostId(userId, postId);
    var threadLocked = request.db.posts.getPostsThread(postId)
    .then(function(thread) { return thread.locked; });

    var promise = Promise.join(threadLocked, bypassAll, bypassSome, isMod, function(locked, all, some, mod) {
      var result = Boom.forbidden();
      // Thread is unlocked or user has elevated privelages
      if (!locked || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (some && mod) { result = false; }
      return result;
    });
    return reply(promise);
  },
  accessLockedThreadWithThreadId: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var bypassAll = getACLValue(request.auth, 'posts.bypassLock.all');
    var bypassSome = getACLValue(request.auth, 'posts.bypassLock.some');
    var isMod = request.db.moderators.isModeratorWithThreadId(userId, threadId);
    var threadLocked = request.db.threads.find(threadId)
    .then(function(thread) { return thread.locked; });

    var promise = Promise.join(threadLocked, bypassAll, bypassSome, isMod, function(locked, all, some, mod) {
      var result = Boom.forbidden();
      // Board is unlocked or user has elevated privelages
      if (!locked || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (some && mod) { result = false; }
      return result;
    });
    return reply(promise);
  },
  isPostWriteable: function(request, reply) {
    var privilege = request.route.settings.app.isPostWriteable;
    var postId = _.get(request, request.route.settings.app.post_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, privilege + '.all');
    var viewSome = getACLValue(request.auth, privilege + '.some');
    var isMod = request.db.moderators.isModeratorWithPostId(userId, postId);
    var postWriteable = request.db.posts.find(postId).then(function(post) { return !post.deleted; });

    var promise = Promise.join(postWriteable, viewAll, viewSome, isMod, function(writeable, all, some, mod) {
      var result = Boom.forbidden();

      if (writeable || all) { result = true; }
      else if (some && mod) { result = true; }

      return result;
    });
    return reply(promise);
  },
  isPostOwner: function(request, reply) {
    var privilege = request.route.settings.app.isPostOwner;
    var postId = _.get(request, request.route.settings.app.post_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var updateAll = getACLValue(request.auth, privilege + '.all');
    var updateSome = getACLValue(request.auth, privilege + '.some');
    var isMod = request.db.moderators.isModeratorWithPostId(userId, postId);
    var postOwner = request.db.posts.find(postId)
    .then(function(post) { return userId === post.user.id; });

    var promise = Promise.join(postOwner, updateAll, updateSome, isMod, function(owner, all, some, mod) {
      var result = Boom.forbidden();

      if (owner || all) { result = true; }
      else if (some && mod) { result = true; }

      return result;
    });

    return reply(promise);
  },
  isPostDeletable: function(request, reply) {
    var privilege = request.route.settings.app.isPostDeletable;
    var postId = _.get(request, request.route.settings.app.post_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var updateAll = getACLValue(request.auth, privilege + '.all');
    var updateSome = getACLValue(request.auth, privilege + '.some');
    var hasSMPrivilege = getACLValue(request.auth, 'threads.moderated');
    var isMod = request.db.moderators.isModeratorWithPostId(userId, postId);
    var isThreadModerated = request.db.posts.isPostsThreadModerated(postId);
    var isThreadOwner = request.db.posts.isPostsThreadOwner(postId, userId);
    var postOwner = request.db.posts.find(postId)
    .then(function(post) { return userId === post.user.id; });

    var promise = Promise.join(postOwner, updateAll, updateSome, isMod, isThreadModerated, isThreadOwner, hasSMPrivilege, function(owner, all, some, mod, threadSM, threadOwner, userSM) {
      var result = Boom.forbidden();

      if (owner || all) { result = true; }
      else if (some && mod) { result = true; }
      else if (threadSM && threadOwner && userSM) { result = true; }

      return result;
    }).catch(console.log);

    return reply(promise);
  },
  isCDRPost: function(request, reply) {
    var postId = _.get(request, request.route.settings.app.post_id);
    var promise = request.db.posts.getThreadFirstPost(postId)
    .then(function(post) {
      var result = true; // return true if not first post
      if (post.id === postId) { result = Boom.forbidden(); } // forbidden if first post
      return result;
    });
    return reply(promise);
  },
  // -- Messages
  isConversationMember: function(request, reply) {
    var userId = request.auth.credentials.id;
    var conversationId = request.payload.conversation_id;

    var promise = request.db.conversations.isConversationMember(conversationId, userId)
    .then(function(isMember) {
      var result = Boom.badRequest();
      if (isMember) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  isMessageOwner: function(request, reply) {
    // isAdmin or message sender
    var userId = request.auth.credentials.id;
    var messageId = request.params.id;
    var getACLValue = request.server.plugins.acls.getACLValue;
    var isDeleteable = getACLValue(request.auth, 'messages.privilegedDelete');
    var isSender = request.db.messages.isMessageSender(messageId, userId);
    var promise = Promise.join(isSender, isDeleteable, function(sender, deleteable) {
      var result = Boom.forbidden();
      if (sender || deleteable) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  // -- Users
  deactivateAuthorized: function(request, reply) {
    var referencedUserId = _.get(request, request.route.settings.app.user_id);
    var currentUserId = request.auth.credentials.id;
    if (referencedUserId === currentUserId) { return reply(); }

    // get user's permissions
    var same = hasPermission(request, 'users.privilegedDeactivate.samePriority');
    var lower = hasPermission(request, 'users.privilegedDeactivate.lowerPriority');

    // get referenced user's priority
    var refPriority = request.db.users.find(referencedUserId)
    .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

    // get authed user priority
    var curPriority = request.db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

    var promise = Promise.join(refPriority, curPriority, function(referenced, current) {
      var result = Boom.forbidden();

      // lower and same are both false, forbidden
      if (!same && !lower) { return result; }
      // current has same or higher priority than referenced
      else if (same && current <= referenced) { result = true; }
      // current has higher priority than referenced
      else if (lower && current < referenced) { result = true; }

      return result;
    });

    return reply(promise);
  },
  reactivateAuthorized: function(request, reply) {
    var referencedUserId = _.get(request, request.route.settings.app.user_id);
    var currentUserId = request.auth.credentials.id;
    if (referencedUserId === currentUserId) { return reply(); }

    // get user's permissions
    var same = hasPermission(request, 'users.privilegedReactivate.samePriority');
    var lower = hasPermission(request, 'users.privilegedReactivate.lowerPriority');

    // get referenced user's priority
    var refPriority = request.db.users.find(referencedUserId)
    .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

    // get authed user priority
    var curPriority = request.db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

    var promise = Promise.join(refPriority, curPriority, function(referenced, current) {
      var result = Boom.forbidden();

      // lower and same are both false, forbidden
      if (!same && !lower) { return result; }
      // current has same or higher priority than referenced
      else if (same && current <= referenced) { result = true; }
      // current has higher priority than referenced
      else if (lower && current < referenced) { result = true; }

      return result;
    });

    return reply(promise);
  },
  isReferencedUserActive: function(request, reply) {
    var userId = _.get(request, request.route.settings.app.user_id);
    var promise = request.db.users.find(userId)
    .then(function(user) {
      var result = true;
      if (user.deleted) { result = Boom.badRequest('Account is Not Active'); }
      return result;
    })
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  },
  isReferencedUserDeactive: function(request, reply) {
    var userId = _.get(request, request.route.settings.app.user_id);
    var promise = request.db.users.find(userId)
    .then(function(user) {
      var result = Boom.badRequest('Account is Active');
      if (user.deleted) { result = true; }
      return result;
    })
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  },
  isOldPasswordValid: function(request, reply) {
    var oldPassword = request.payload.old_password;
    var userId = request.auth.credentials.id;

    // bypass check if no old password given
    if (!oldPassword) { return reply(true); }

    // check if oldPassword matches what's in the db
    var promise = request.db.users.find(userId)
    .then(function(user) {
      var valid = Boom.badRequest();
      if (bcrypt.compareSync(oldPassword, user.passhash)) { valid = true; }
      return valid;
    });
    return reply(promise);
  },
  isNewUsernameUnique: function(request, reply) {
    var userId = request.auth.credentials.id;
    var username = request.payload.username ? querystring.unescape(request.payload.username) : undefined;

    // bypass check if no email given
    if (!username) { return reply(true); }

    // check if user exists with this email
    var promise = request.db.users.userByUsername(username)
    .then(function(user) {
      var unique = Boom.badRequest();
      // username hasn't changed
      if (user && user.id === userId) { unique = true; }
      // user with this username already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this username
      else { unique = true; }

      return unique;
    });
    return reply(promise);
  },
  isNewEmailUnique: function(request, reply) {
    var userId = request.auth.credentials.id;
    var email = request.payload.email;

    // bypass check if no email given
    if (!email) { return reply(true); }

    // check if user exists with this email
    var promise = request.db.users.userByEmail(email)
    .then(function(user) {
      var unique = Boom.badRequest();
      // email hasn't changed
      if (user && user.id === userId) { unique = true; }
      // user with this email already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this email
      else { unique = true; }

      return unique;
    });
    return reply(promise);
  },
  accessUser: function(request, reply) {
    var username = getUsername(request);
    var payloadUsername = querystring.unescape(request.params.username);

    if (username === payloadUsername) { return reply(true); }

    var conditions = [
      isUserActive(request, payloadUsername),
      hasPermission(request, 'users.viewDeleted')
    ];
    return reply(checkAuth(conditions, Boom.notFound()));
  },
  // -- Admin Reports
  canUpdateUserReportNote: function(request, reply) {
    var userId = request.auth.credentials.id;
    var noteId = request.payload.id;
    var promise = request.db.reports.findUserReportNote(noteId)
    .then(function(note) {
      var retVal = Boom.unauthorized('Only the author of this user report note can update it');
      if (note.user_id === userId) { retVal = true; }
      return retVal;
    });
    return reply(promise);
  },
  canUpdatePostReportNote: function(request, reply) {
    var userId = request.auth.credentials.id;
    var noteId = request.payload.id;
    var promise = request.db.reports.findPostReportNote(noteId)
    .then(function(note) {
      var retVal = Boom.unauthorized('Only the author of this post report note can update it');
      if (note.user_id === userId) { retVal = true; }
      return retVal;
    });
    return reply(promise);
  },
  canUpdateMessageReportNote: function(request, reply) {
    var userId = request.auth.credentials.id;
    var noteId = request.payload.id;
    var promise = request.db.reports.findMessageReportNote(noteId)
    .then(function(note) {
      var retVal = Boom.unauthorized('Only the author of this message report note can update it');
      if (note.user_id === userId) { retVal = true; }
      return retVal;
    });
    return reply(promise);
  },
  // -- Admin Roles
  preventDefaultRoleDeletion: function(request, reply) {
    var defaultRoleIds = [
      'irXvScLORCGVJLtF8onULA', // Super Administrator
      'BoYOb5rATCqNnEFzQwYvuA', // Administrator
      '-w9wtzZST32hZgXuaOdCjQ', // Global Moderator
      'wNOXcRVBS3GRIq8HNsrSPQ', // Moderator
      '7c2Pd840RDO6hRf5sXo7YA', // User
      'Z6qgHsx0TD2bP1am9lRwmA', // Banned
      '2j9S2kjDRIeFm7uyloUD4Q', // Anonymous
      '80kyFis5QceKXgR1Qo0q9A', // Private
    ];

    var roleId = request.params.id;
    var canDelete = true;
    if (defaultRoleIds.indexOf(roleId) > -1) {
      canDelete = Boom.badRequest('You may not delete the default roles.');
    }
    return reply(canDelete);
  },
  // -- Admin Users
  isNewUsernameUniqueAdmin: function(request, reply) {
    var referencedUserId = request.payload.id;
    var username = request.payload.username ? querystring.unescape(request.payload.username) : undefined;

    // bypass check if no email given
    if (!username) { return reply(true); }

    // check if user exists with this email
    var promise = request.db.users.userByUsername(username)
    .then(function(user) {
      var unique = Boom.badRequest();
      // username hasn't changed
      if (user && user.id === referencedUserId) { unique = true; }
      // user with this username already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this username
      else { unique = true; }
      return unique;
    });
    return reply(promise);
  },
  isNewEmailUniqueAdmin: function(request, reply) {
    var referencedUserId = request.payload.id;
    var email = request.payload.email;

    // bypass check if no email given
    if (!email) { return reply(true); }

    // check if user exists with this email
    var promise = request.db.users.userByEmail(email)
    .then(function(user) {
      var unique = Boom.badRequest();
      // email hasn't changed
      if (user && user.id === referencedUserId) { unique = true; }
      // user with this email already exists and is not this user
      else if (user) { unique = Boom.badRequest(); }
      // no user with this email
      else { unique = true; }
      return unique;
    });
    return reply(promise);
  },
  matchPriority: function(request, reply) {
    var referencedUserId = _.get(request, request.route.settings.app.user_id);
    var privilege = request.route.settings.app.privilege;
    var currentUserId = request.auth.credentials.id;

    if (referencedUserId === currentUserId) { return reply(); }

    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, privilege + '.samePriority');
    var lowerPriority = getACLValue(request.auth, privilege + '.lowerPriority');

    // get referenced user's priority
    var refPriority = request.db.users.find(referencedUserId)
    .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

    // get authed user priority
    var curPriority = request.db.users.find(currentUserId)
    .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

    var promise = Promise.join(refPriority, curPriority, samePriority, lowerPriority, function(referenced, current, same, lower) {
      var result = Boom.forbidden();

      // lower and same are both false, forbidden
      if (!same && !lower) { return result; }
      // current has same or higher priority than referenced
      else if (same && current <= referenced) { result = referencedUserId; }
      // current has higher priority than referenced
      else if (lower && current < referenced) { result = referencedUserId; }

      return result;
    });

    return reply(promise);
  },
  hasAccessToRole: function(request, reply) {
    var authedUserId = request.auth.credentials.id;
    var roleId = request.payload.role_id;
    var authedPriority, refRole;
    var promise = request.db.users.find(authedUserId)
    .then(function(curUser) {  // get authed user priority
      authedPriority = _.min(_.map(curUser.roles, 'priority'));
      return request.db.roles.all();
    })
    .then(function(roles) { // get role were trying to ad users to
      refRole = _.find(roles, _.matchesProperty('id', roleId));
    })
    .then(function() {
      var result = true;
      // make sure authed user is adding to a role with their priority or lower
      // this prevents admins from adding themselves/others as super admins
      if (refRole.priority < authedPriority) {
        result = Boom.forbidden('You don\'t have permission to add users to the ' + refRole.name + ' role.');
      }
      return result;
    });

    reply(promise);
  },
  hasSufficientPriorityToAddRole: function(request, reply) {
    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, 'adminUsers.privilegedAddRoles.samePriority');
    var lowerPriority = getACLValue(request.auth, 'adminUsers.privilegedAddRoles.lowerPriority');
    var promise = Boom.forbidden();

    if (samePriority || lowerPriority) {
      var usernames = request.payload.usernames;
      var authedUserId = request.auth.credentials.id;

      // get authed user priority
      var authedPriority = request.db.users.find(authedUserId)
      .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });
      var refUsername;
      promise = Promise.each(usernames, function(username) {
        refUsername = username;
        var refPriority = request.db.users.userByUsername(username)
        .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); });

        // users can modify themselves
        if (refUsername === request.auth.credentials.username) { return true; }
        return Promise.join(refPriority, authedPriority, samePriority, lowerPriority, function(referenced, current, same, lower) {
          var result = false;
          // lower and same are both false, forbidden
          if (!same && !lower) { return result; }
          // current has same or higher priority than referenced
          else if (same && current <= referenced) { result = true; }
          // current has higher priority than referenced
          else if (lower && current < referenced) { result = true; }
          if (result) { return result; }
          else { throw Error('Invalid permissions'); }
        });
      })
      .catch(function() { return Boom.forbidden('You don\'t have permission to add roles to ' + refUsername); });
    }

    return reply(promise);
  },
  hasSufficientPriorityToRemoveRole: function(request, reply) {
    // get user's permissions
    var getACLValue = request.server.plugins.acls.getACLValue;
    var samePriority = getACLValue(request.auth, 'adminUsers.privilegedRemoveRoles.samePriority');
    var lowerPriority = getACLValue(request.auth, 'adminUsers.privilegedRemoveRoles.lowerPriority');
    var promise = Boom.forbidden();

    var refUserId = request.payload.user_id;
    var authedUserId = request.auth.credentials.id;

    if (refUserId === authedUserId) { promise = true; }
    else if (samePriority || lowerPriority) {
      var refUsername;

      // get authed user priority
      var authedPriority = request.db.users.find(authedUserId)
      .then(function(curUser) { return _.min(_.map(curUser.roles, 'priority')); });

      var refPriority = request.db.users.find(refUserId)
      .then(function(refUser) {
        refUsername = refUser.username;
        return _.min(_.map(refUser.roles, 'priority'));
      });

      promise = Promise.join(refPriority, authedPriority, samePriority, lowerPriority, function(referenced, current, same, lower) {
        var result = Boom.forbidden('You don\'t have permission to remove the roles from ' + refUsername);
        // lower and same are both false, forbidden
        if (!same && !lower) { return result; }
        // current has same or higher priority than referenced
        else if (same && current <= referenced) { result = true; }
        // current has higher priority than referenced
        else if (lower && current < referenced) { result = true; }

        return result;
      });
    }
    return reply(promise);
  },
  isPriorityRestricted: function(request, reply) {
    var getPriorityRestrictions = request.server.plugins.acls.getPriorityRestrictions;
    var priorityRestrictions = getPriorityRestrictions(request.auth);
    var promise;
    if (priorityRestrictions && priorityRestrictions.length) {
      var refUserId = _.get(request, request.route.settings.app.user_id);
      promise = request.db.users.find(refUserId)
      .then(function(refUser) { return _.min(_.map(refUser.roles, 'priority')); })
      .then(function(refPriority) {
        var result = true;
        // check if the user being messaged has a priority the authed user has access to msg
        if (priorityRestrictions.indexOf(refPriority) < 0) {
          result = Boom.forbidden('You have been restricted from performing this action, please contact an administrator');
        }
        return result;
      });
    }
    return reply(promise);
  }
};

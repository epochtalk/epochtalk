var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var querystring = require('querystring');
var bbcodeParser = require('epochtalk-bbcode-parser');
var db = require(path.normalize(__dirname + '/../../../db'));
var config = require(path.normalize(__dirname + '/../../../config'));
var imageStore = require(path.normalize(__dirname + '/../../images'));
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));

module.exports = {
  canViewDeletedPost: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var postId = _.get(request, request.route.settings.app.post_id);

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'posts.viewDeleted.all');
    var viewSome = getACLValue(request.auth, 'posts.viewDeleted.some');
    var isMod = db.moderators.isModeratorWithPostId(userId, postId);

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
    var modBoards = db.moderators.getUsersBoards(userId);

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
    var isMod = db.moderators.isModeratorWithPostId(userId, postId);

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
    var isMod = db.moderators.isModeratorWithPostId(userId, postId);
    var boardVisible = db.posts.getPostsBoardInBoardMapping(postId, priority);

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
  accessBoardWithThreadId: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var threadId = _.get(request, request.route.settings.app.thread_id);

    var getUserPriority = request.server.plugins.acls.getUserPriority;
    var priority = getUserPriority(request.auth);
    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var isMod = db.moderators.isModeratorWithThreadId(userId, threadId);
    var boardVisible = db.threads.getThreadsBoardInBoardMapping(threadId, priority);

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
    var isMod = db.moderators.isModeratorWithPostId(userId, postId);
    var threadLocked = db.posts.getPostsThread(postId)
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
    var isMod = db.moderators.isModeratorWithThreadId(userId, threadId);
    var threadLocked = db.threads.find(threadId)
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
  isPostWriteable: function(request, reply) {
    var privilege = request.route.settings.app.isPostWriteable;
    var postId = _.get(request, request.route.settings.app.post_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewAll = getACLValue(request.auth, privilege + '.all');
    var viewSome = getACLValue(request.auth, privilege + '.some');
    var isMod = db.moderators.isModeratorWithPostId(userId, postId);
    var postWriteable = db.posts.find(postId).then(function(post) { return !post.deleted; });

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
    var isMod = db.moderators.isModeratorWithPostId(userId, postId);
    var postOwner = db.posts.find(postId)
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
    var isMod = db.moderators.isModeratorWithPostId(userId, postId);
    var isThreadModerated = db.posts.isPostsThreadModerated(postId);
    var isThreadOwner = db.posts.isPostsThreadOwner(postId, userId);
    var postOwner = db.posts.find(postId)
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
    var promise = db.posts.getThreadFirstPost(postId)
    .then(function(post) {
      var result = true; // return true if not first post
      if (post.id === postId) { result = Boom.forbidden(); } // forbidden if first post
      return result;
    });
    return reply(promise);
  },
  accessUser: function(request, reply) {
    var username = '';
    var payloadUsername = querystring.unescape(request.params.username);
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }

    // deleted users can see their own posts
    if (username === payloadUsername) { return reply(true); }

    var getACLValue = request.server.plugins.acls.getACLValue;
    var priviledgedView = getACLValue(request.auth, 'users.viewDeleted');

    var isActive = db.users.userByUsername(payloadUsername)
    .then(function(user) {
      var active = false;
      if (user) { active = !user.deleted; }
      return active;
    });

    // Authed users with privilegedView can see deleted user's posts
    var promise = Promise.join(priviledgedView, isActive, function(privileged, active) {
      var result = Boom.notFound();
      if (priviledgedView || active) { result = true; }
      return result;
    });

    return reply(promise);
  },
  clean: function(request, reply) {
    request.payload.title = sanitizer.strip(request.payload.title);
    request.payload.raw_body = sanitizer.bbcode(request.payload.raw_body);
    return reply();
  },
  adjustQuoteDate: function(request, reply) {
    var input = request.payload.raw_body;
    var reg = /\[quote.*?(date=[0-9]*).*?\]/gi;
    var matchArray;
    var replaceArray = [];

    while ((matchArray = reg.exec(input)) !== null) {
      replaceArray.push(matchArray[1]);
    }

    replaceArray.forEach(function(oldDate) {
      var date = Number(oldDate.replace('date=', ''));
      var newDate = 'date=' + date * 1000;
      request.payload.raw_body = request.payload.raw_body.replace(oldDate, newDate);
    });

    return reply();
  },
  parseEncodings: function(request, reply) {
    var raw_body = request.payload.raw_body;
    // check if raw_body has any bbcode
    if (raw_body.indexOf('[') >= 0) {
      // convert all (<, &lt;) and (>, &gt;) to decimal to escape the regex
      // in the bbcode parser that'll unescape those chars
      raw_body = raw_body.replace(/(?:<|&lt;)/g, '&#60;');
      raw_body = raw_body.replace(/(?:>|&gt;)/g, '&#62;');

      // convert all unicode characters to their numeric representation
      // this is so we can save it to the db and present it to any encoding
      raw_body = textToEntities(raw_body);

      // parse raw_body to generate body
      var parsedBody = bbcodeParser.process({text: raw_body}).html;
      request.payload.body = parsedBody;

      // check if parsing was needed
        // it wasn't need so remove raw_body
      if (parsedBody === raw_body) { request.payload.raw_body = ''; }
    }
    else {
      // nothing to parse, just move raw_body to body
      request.payload.body = request.payload.raw_body;
      request.payload.raw_body = '';
    }

    return reply();
  },
  subImages: function(request, reply) {
    // load html in post.body into cheerio
    var html = request.payload.body;
    var $ = cheerio.load(html);

    // collect all the images in the body
    var images = [];
    $('img').each(function(index, element) {
      images.push(element);
    });

    // convert each image's src to cdn version
    return Promise.map(images, function(element) {
      var imgSrc = $(element).attr('src');
      var storage = config.images.storage;
      var savedUrl = imageStore[storage].saveImage(imgSrc);

      if (savedUrl) {
        // move original src to data-canonical-src
        $(element).attr('data-canonical-src', imgSrc);
        // update src with new url
        $(element).attr('src', savedUrl);
      }
    })
    .then(function() {
      request.payload.body = $.html();
      return reply();
    })
    .catch(function(err) { return reply(err); });
  }
};

function textToEntities(text) {
  var entities = '';
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += '&#' + text.charCodeAt(i) + ';';
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}

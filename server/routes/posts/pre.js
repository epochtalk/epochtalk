var path = require('path');
var Boom = require('boom');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var bbcodeParser = require('epochtalk-bbcode-parser');
var db = require(path.normalize(__dirname + '/../../../db'));
var config = require(path.normalize(__dirname + '/../../../config'));
var imageStore = require(path.normalize(__dirname + '/../../images'));
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));
var commonPre = require(path.normalize(__dirname + '/../common')).auth;
var querystring = require('querystring');

module.exports = {
  canViewDeletedPost: function(request, reply) {
    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, 'user.viewDeleted.some');
    var viewAll = getACLValue(request.auth, 'user.viewDeleted.all');
    var result = viewAll;
    if (request.auth.isAuthenticated && viewSome) {
      result = isModWithPostId(request.auth.credentials.id, request.params.id);
    }
    return reply(result);
  },
  accessBoardWithPostId: function(request, reply) {
    var postId = request.params.id;
    var boardVisible = db.posts.getPostsBoardInBoardMapping(postId)
    .then(function(board) {
      var visible = false;
      if (board) { visible = true; }
      return visible;
    });

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');

    var promise = Promise.join(boardVisible, viewSome, viewAll, function(visible, some, all) {
      var result = Boom.unauthorized();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (request.auth.isAuthenticated && some) {
        result = isModWithPostId(request.auth.credentials.id, postId) || Boom.forbidden();
      }
      // User is authenticated but has no privelages
      else if (request.auth.isAuthenticated) { result = Boom.forbidden(); }
      return result;
    });
    return reply(promise);
  },
  accessBoardWithThreadId: function(request, reply) {
    var threadId = request.query.thread_id || request.payload.thread_id;
    var boardVisible = db.threads.getThreadsBoardInBoardMapping(threadId)
    .then(function(board) {
      var visible = false;
      if (board) { visible = true; }
      return visible;
    });

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, 'boards.viewUncategorized.some');
    var viewAll = getACLValue(request.auth, 'boards.viewUncategorized.all');

    var promise = Promise.join(boardVisible, viewSome, viewAll, function(visible, some, all) {
      var result = Boom.unauthorized();
      // Board is visible or user has elevated privelages
      if (visible || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (request.auth.isAuthenticated && some) {
        result = isModWithThreadId(request.auth.credentials.id, threadId) || Boom.forbidden();
      }
      // User is authenticated but has no privelages
      else if (request.auth.isAuthenticated) { result = Boom.forbidden(); }
      return result;
    });
    return reply(promise);
  },
  accessLockedThread: function(request, reply) {
    var threadId = request.payload.thread_id;
    var threadLocked =  db.threads.find(threadId)
    .then(function(thread) {
      return thread.locked;
    });

    var getACLValue = request.server.plugins.acls.getACLValue;
    var createSome = getACLValue(request.auth, 'boards.createInLockedThread.some');
    var createAll = getACLValue(request.auth, 'boards.createInLockedThread.all');

    var promise = Promise.join(threadLocked, createSome, createAll, function(locked, some, all) {
      var result = Boom.unauthorized();
      // Board is unlocked or user has elevated privelages
      if (!locked || all) { result = true; }
      // User is authenticated and can moderate certain boards
      else if (request.auth.isAuthenticated && some) {
        result = isModWithThreadId(request.auth.credentials.id, threadId) || Boom.forbidden();
      }
      // User is authenticated but has no privelages
      else if (request.auth.isAuthenticated) { result = Boom.forbidden(); }
      return result;
    });
    return reply(promise);
  },
  isUserActive: function(request, reply) {
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
  accessPrivateBoardWithThreadId: function(request, reply) {
    // TODO: Implement private board check
    return reply(true);
  },
  canCreate: function(request, reply) {
    var username = '';
    var threadId = request.payload.thread_id;
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }

    // TODO: Separate logic out into three different pre methods
    // 1): pull ignoreLock boolean and test with thread locked
    // 2): check board permission, does this user have permission to post in this board
    // 3): (optional) pull postUncategorizedBoard boolean and test with uncat board
    // 4): Error on user account deleted
    var isLocked = isThreadLocked(threadId);
    var isBoardVisible = isThreadBoardVisible(threadId);
    var isActive = isUserActive(username);

    var promise = Promise.join(isLocked, isBoardVisible, isActive, function(locked, visible, active) {
      var result = Boom.forbidden();
      // WARNING: currently admins/mods cannot post after lock
      if (locked) { result = Boom.forbidden; }
      else if (visible && active) { result = ''; }

      return result;
    });
    return reply(promise);
  },
  canUpdate: function(request, reply) {
    var postId = request.params.id;
    var userId = '';
    var username = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }
    if (authenticated) { userId = request.auth.credentials.id; }

    // TODO: Separate logic out into three different pre methods
    // 1): pull ignoreLock boolean and test with thread locked
    // 2): pull postPrivateBoard boolean and test with private boards
    // 3): (optional) pull postUncategorizedBoard boolean and test with uncat board
    // 4): Error on user account deleted
    // 5): pull editEqualPriority boolean and test with creator's role priority
    // 6): Check if user is author of post
    var isLocked = isPostThreadLocked(postId);
    var isOwner = isPostOwner(userId, postId);
    var isDeleted = isPostDeleted(postId);
    var isBoardVisible = isPostBoardVisible(postId);
    var isActive = isUserActive(username);

    var promise = Promise.join(isLocked, isOwner, isDeleted, isBoardVisible, isActive, function(locked, owner, deleted, visible, active) {
      var result = Boom.forbidden();
      // WARNING: currently admins/mods cannot post after lock
      if (deleted) { result = Boom.notFound(); }
      else if (!visible) { result = Boom.notFound(); }
      else if (locked) { result = Boom.forbidden(); }
      else if (owner && active) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  canDelete: function(request, reply) {
    var postId = request.params.id;
    var userId = '';
    var username = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }
    if (authenticated) { userId = request.auth.credentials.id; }

    var isLocked = isPostThreadLocked(postId);
    var isOwner = isPostOwner(userId, postId);
    var isAdmin = commonPre.isAdmin(authenticated, username);
    var isFirst = isFirstPost(postId);
    var isBoardVisible = isPostBoardVisible(postId);
    var isActive = isUserActive(username);

    var promise = Promise.join(isAdmin, isLocked, isOwner, isFirst, isBoardVisible, isActive, function(admin, locked, owner, firstPost, visible, active) {
      var result = Boom.forbidden();
      if (firstPost) { result = Boom.forbidden(); }
      else if (admin) { result = ''; }
      else if (!visible) { result = Boom.notFound(); }
      else if (locked) { result = Boom.forbidden(); }
      else if (owner && active) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  canPurge: function(request, reply) {
    var postId = request.params.id;
    var username = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }

    var isAdmin = commonPre.isAdmin(authenticated, username);
    var isFirst = isFirstPost(postId);

    var promise = Promise.join(isAdmin, isFirst, function(admin, firstPost) {
      var result = Boom.forbidden();
      if (firstPost) { result = Boom.forbidden(); }
      else if (admin) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  canPageByUser: function(request, reply) {
    var username = '';
    var payloadUsername = request.params.username;
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { username = request.auth.credentials.username; }

    var isAdmin = commonPre.isAdmin(authenticated, username);
    var isMod = commonPre.isMod(authenticated, username);
    var isActive = isUserActive(payloadUsername);

    var promise = Promise.join(isAdmin, isMod, isActive, function(admin, mod, active) {
      var result = Boom.notFound();
      if (admin || mod) { result = ''; }
      else if (username === payloadUsername) { result = ''; }
      else if (active === false) { result = Boom.notFound(); }
      else if (active === true) { result = '';}
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

function isModWithThreadId(userId, threadId) {
  // TODO: Implement check against board_moderators
  return true;
}

function isModWithPostId(userId, postId) {
  // TODO: Implement check against board_moderators
  return true;
}

function textToEntities(text) {
  var entities = "";
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += "&#" + text.charCodeAt(i) + ";";
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}


function isPostThreadLocked(postId) {
  return db.posts.getPostsThread(postId)
  .then(function(thread) { return thread.locked; });
}

function isPostOwner(userId, postId) {
  return db.posts.find(postId)
  .then(function(post) { return post && post.user.id === userId; });
}

function isFirstPost(postId) {
  return db.posts.getThreadFirstPost(postId)
  .then(function(post) { return post.id === postId; });
}

function isPostDeleted(postId) {
  return db.posts.find(postId)
  .then(function(post) { return post.deleted; });
}

function isUserActive(username) {
  var active = false;
  if (!username) { return Promise.resolve(active); }
  username = querystring.unescape(username);
  return db.users.userByUsername(username)
  .then(function(user) {
    if (user) { active = !user.deleted; }
    return active;
  });
}

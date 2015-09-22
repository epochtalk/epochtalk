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
    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, 'posts.viewDeleted.some');
    var viewAll = getACLValue(request.auth, 'posts.viewDeleted.all');
    var result = viewAll;
    if (request.auth.isAuthenticated && viewSome) {
      result = isModWithPostId(request.auth.credentials.id, request.params.id);
    }
    return reply(result);
  },
  accessBoardWithPostId: function(request, reply) {
    var postId = _.get(request, request.route.settings.app.post_id);
    var boardVisible = db.posts.getPostsBoardInBoardMapping(postId)
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
        result = isModWithPostId(request.auth.credentials.id, postId);
      }
      return result;
    });
    return reply(promise);
  },
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
  accessLockedThreadWithPostId: function(request, reply) {
    var postId = _.get(request, request.route.settings.app.post_id);
    var threadLocked = db.posts.getPostsThread(postId)
    .then(function(thread) { return thread.locked; });

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
  accessLockedThreadWithThreadId: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var threadLocked = db.threads.find(threadId)
    .then(function(thread) { return thread.locked; });

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
  isRequesterActive: function(request, reply) {
    var promise = Boom.unauthorized();
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) {
      var userId = request.auth.credentials.id;
      promise = db.users.find(userId)
      .then(function(user) {
        var active = Boom.forbidden();
        if (user) { active = !user.deleted; }
        return active;
      });
    }
    return reply(promise);
  },
  accessPrivateBoardWithPostId: function(request, reply) {
    // TODO: Implement private board check
    return reply(true);
  },
  accessPrivateBoardWithThreadId: function(request, reply) {
    // TODO: Implement private board check
    return reply(true);
  },
  isPostWriteable: function(request, reply) {
    var privilege = request.route.settings.app.isPostWriteable;
    var postId = _.get(request, request.route.settings.app.post_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var viewSome = getACLValue(request.auth, privilege + '.some');
    var viewAll = getACLValue(request.auth, privilege + '.all');
    var postWriteable = db.posts.find(postId).then(function(post) { return !post.deleted; });

    var promise = Promise.join(postWriteable, viewSome, viewAll, function(writeable, some, all) {
      var result = Boom.forbidden();

      if (writeable || all) { result = true; }
      else if (some) { result = isModWithPostId(userId, postId); }

      return result;
    });
    return reply(promise);
  },
  isPostOwner: function(request, reply) {
    var privilege = request.route.settings.app.isPostOwner;
    var postId = _.get(request, request.route.settings.app.post_id);
    var userId = request.auth.credentials.id;

    var getACLValue = request.server.plugins.acls.getACLValue;
    var updateSome = getACLValue(request.auth, privilege + '.some');
    var updateAll = getACLValue(request.auth, privilege + '.all');
    var postOwner = db.posts.find(postId)
    .then(function(post) { return userId === post.user.id; });

    var promise = Promise.join(postOwner, updateSome, updateAll, function(owner, some, all) {
      var result = Boom.forbidden();

      if (owner || all) { result = true; }
      else if (some) { result = isModWithPostId(userId, postId); }

      return result;
    });

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

    var promise = Boom.notFound();
    // deleted users can see their own posts
    if (username === payloadUsername) { promise = true; }
    else { // viewing deleted users posts
      var getACLValue = request.server.plugins.acls.getACLValue;
      var priviledgedView = getACLValue(request.auth, 'users.viewDeleted');

      var isActive = db.users.userByUsername(payloadUsername)
      .then(function(user) {
        var active = false;
        if (user) { active = !user.deleted; }
        return active;
      });

      // Authed users with privilegedView can see deleted user's posts
      promise = Promise.join(priviledgedView, isActive, function(privileged, active) {
        var result = Boom.notFound();
        if (priviledgedView || active) { result = true; }
        return result;
      });
    }

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
  var entities = '';
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += '&#' + text.charCodeAt(i) + ';';
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}

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

module.exports = {
  canFind: function(request, reply) {
    var postId = request.params.id;
    var isThreadDeleted = isPostThreadDeleted(postId);
    var isBoardDeleted = isPostBoardDeleted(postId);

    var promise = Promise.join(isThreadDeleted, isBoardDeleted, function(threadDeleted, boardDeleted) {
      var reject = false;
      if (threadDeleted || boardDeleted) { reject = true; }
      if (reject) { return Boom.forbidden(); }
    });
    return reply(promise);
  },
  canRetrieve: function(request, reply) {
    var threadId = request.query.thread_id;
    var isDeleted = isThreadDeleted(threadId);
    var isBoardDeleted = isThreadBoardDeleted(threadId);

    var promise = Promise.join(isDeleted, isBoardDeleted, function(threadDeleted, boardDeleted) {
      var reject = false;
      if (threadDeleted || boardDeleted) { reject = true; }
      if (reject) { return Boom.forbidden(); }
    });
    return reply(promise);
  },
  canCreate: function(request, reply) {
    var threadId = request.payload.thread_id;
    var isLocked = isThreadLocked(threadId);
    var isDeleted = isThreadDeleted(threadId);
    var isBoardDelete = isThreadBoardDeleted(threadId);

    var promise = Promise.join(isLocked, isDeleted, isBoardDelete, function(locked, deleted, boardDeleted) {
      var reject = false;
      if (deleted || boardDeleted) { reject = true; }
      else if (locked) { reject = true; }
      if (reject) { return Boom.forbidden(); }
    });
    return reply(promise);
  },
  canUpdate: function(request, reply) {
    var postId = request.params.id;
    var userId = request.auth.credentials.id;
    var username = request.auth.credentials.username;
    var authenticated = request.auth.isAuthenticated;

    var isLocked = isPostThreadLocked(postId);
    var isOwner = isPostOwner(userId, postId);
    var isAdmin = commonPre.isAdmin(authenticated, username);
    var isThreadDeleted = isPostThreadDeleted(postId);
    var isBoardDeleted = isPostBoardDeleted(postId);

    var promise = Promise.join(isAdmin, isLocked, isOwner, isThreadDeleted, isBoardDeleted, function(admin, locked, owner, threadDeleted, boardDeleted) {
      var reject = true;
      if (admin) { reject = false; }
      else if (threadDeleted) { reject = true; }
      else if (boardDeleted) { reject = true; }
      else if (locked) { reject = true; }
      else if (owner) { reject = false; }
      if (reject) { return Boom.forbidden(); }
    });
    return reply(promise);
  },
  canDelete: function(request, reply) {
    var postId = request.params.id;
    var userId = request.auth.credentials.id;
    var username = request.auth.credentials.username;
    var authenticated = request.auth.isAuthenticated;

    var isLocked = isPostThreadLocked(postId);
    var isOwner = isPostOwner(userId, postId);
    var isAdmin = commonPre.isAdmin(authenticated, username);
    var isFirst = isFirstPost(postId);
    var isThreadDeleted = isPostThreadDeleted(postId);
    var isBoardDeleted = isPostBoardDeleted(postId);

    var promise = Promise.join(isAdmin, isLocked, isOwner, isFirst, isThreadDeleted, isBoardDeleted, function(admin, locked, owner, firstPost, threadDeleted, boardDeleted) {
      var reject = true;
      if (firstPost) { reject = true }
      else if (admin) { reject = false; }
      else if (threadDeleted) { reject = true; }
      else if (boardDeleted) { reject = true; }
      else if (locked) { reject = true; }
      else if (owner) { reject = false; }
      if (reject) { return Boom.forbidden(); }
    });
    return reply(promise);
  },
  canPurge: function(request, reply) {
    var postId = request.params.id;
    var authenticated = request.auth.isAuthenticated;
    var username = request.auth.credentials.username;

    var isAdmin = commonPre.isAdmin(authenticated, username);
    var isFirst = isFirstPost(postId);

    var promise = Promise.join(isAdmin, isFirst, function(admin, firstPost) {
      var reject = true;
      if (firstPost) { reject = true; }
      else if (admin) { reject = false; }
      if (reject) { return Boom.forbidden(); }
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
      if (parsedBody === raw_body) { request.payload.raw_body = null; }
    }
    else {
      // nothing to parse, just move raw_body to body
      request.payload.body = request.payload.raw_body;
      request.payload.raw_body = null;
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
  var entities = "";
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += "&#" + text.charCodeAt(i) + ";";
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}

function isThreadDeleted(threadId) {
  return db.threads.deepFind(threadId)
  .then(function(thread) { return thread.deleted; });
}

function isThreadBoardDeleted(threadId) {
  return db.threads.getThreadsBoard(threadId)
  .then(function(board) { return board.deleted; });
}

function isThreadLocked(threadId) {
  return db.threads.find(threadId)
  .then(function(thread) { return thread.locked; });
}

function isPostThreadLocked(postId) {
  return db.posts.getPostsThread(postId)
  .then(function(thread) { return thread.locked; });
}

function isPostThreadDeleted(postId) {
  return db.posts.getPostsThread(postId)
  .then(function(thread) { return thread.deleted; });
}

function isPostBoardDeleted(postId) {
  return db.posts.getPostsBoard(postId)
  .then(function(board) { return board.deleted; });
}

function isPostOwner(userId, postId) {
  return db.posts.deepFind(postId)
  .then(function(post) { return post.user_id === userId; });
}

function isFirstPost(postId) {
  return db.posts.getThreadFirstPost(postId)
  .then(function(post) { return post.id === postId; });
}

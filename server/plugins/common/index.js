var path = require('path');
var uuid = require('node-uuid');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var bbcodeParser = require('epochtalk-bbcode-parser');
var config = require(path.normalize(__dirname + '/../../../config'));
var imageStore = require(path.normalize(__dirname + '/../../images'))();

// -- internal methods

function categoriesClean(sanitizer, payload) {
  payload.name = sanitizer.strip(payload.name);
}

function boardsClean(sanitizer, payload) {
  // name
  payload.name = sanitizer.strip(payload.name);

  // description
  if (payload.description) {
    payload.description = sanitizer.display(payload.description);
  }
}

function usersClean(sanitizer, payload) {
  var keys = ['username', 'email', 'name', 'website', 'btcAddress', 'gender', 'location', 'language', 'avatar', 'position'];
  keys.map(function(key) {
    if (payload[key]) { payload[key] = sanitizer.strip(payload[key]); }
  });

  var displayKeys = ['signature', 'raw_signature'];
  displayKeys.map(function(key) {
    if (payload[key]) { payload[key] = sanitizer.display(payload[key]); }
  });
}

function postsClean(sanitizer, payload) {
  payload.title = sanitizer.strip(payload.title);
  payload.raw_body = sanitizer.bbcode(payload.raw_body);
}

function messagesClean(sanitizer, payload) {
  payload.body = sanitizer.bbcode(payload.body);
}

function postsParse(payload) {
  var raw_body = payload.raw_body;
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
    payload.body = parsedBody;

    // check if parsing was needed
    // it wasn't need so remove raw_body
    if (parsedBody === raw_body) { payload.raw_body = ''; }
  }
  else {
    // convert all unicode characters to their numeric representation
    // this is so we can save it to the db and present it to any encoding
    raw_body = textToEntities(raw_body);

    // nothing to parse, just move raw_body to body
    payload.body = raw_body;
    payload.raw_body = '';
  }
}

function messagesParse(payload) {
  var raw_body = payload.body;
  // check if raw_body has any bbcode
  if (raw_body.indexOf('[') >= 0) {
    // convert all (<, &lt;) and (>, &gt;) to decimal to escape the regex
    // in the bbcode parser that'll unescape those chars
    raw_body = raw_body.replace(/(?:<|&lt;)/g, '&#60;');
    raw_body = raw_body.replace(/(?:>|&gt;)/g, '&#62;');

    // convert all unicode characters to their numeric representation
    // this is so we can save it to the db and present it to any encoding
    raw_body = textToEntities(raw_body);

    // save back to request.payload.body
    payload.body = bbcodeParser.process({text: raw_body}).html;
  }
  else { payload.body = textToEntities(raw_body); }
}

function usersParse(payload) {
  var raw_signature = payload.raw_signature;
  // check if raw_signature has any bbcode
  if (raw_signature && raw_signature.indexOf('[') >= 0) {
    // convert all &lt; and &gt; to decimal to escape the regex
    // in the bbcode parser that'll unescape those chars
    raw_signature = raw_signature.replace(/(?:\r\n|\r|\n)/g, '<br />');
    raw_signature = raw_signature.replace(/&gt;/g, '&#62;');
    raw_signature = raw_signature.replace(/&lt;/g, '&#60;');

    // convert all unicode characters to their numeric representation
    // this is so we can save it to the db and present it to any encoding
    raw_signature = textToEntities(raw_signature);

    // parse raw_signature to generate body
    payload.signature = bbcodeParser.process({text: raw_signature}).html;
  }
  else if (raw_signature) {
    raw_signature = raw_signature.replace(/(?:\r\n|\r|\n)/g, '<br />');

    // convert all unicode characters to their numeric representation
    // this is so we can save it to the db and present it to any encoding
    payload.signature = textToEntities(raw_signature);
  }
  else if (raw_signature === '') { payload.signature = ''; }
}

function imagesSub(payload) {
  var html = payload.body;
  // load html in post.body into cheerio
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
  .then(function() { payload.body = $.html(); });
}

function imagesSignature(payload) {
  // remove images in signature
  if (payload.signature) {
    var $ = cheerio.load(payload.signature);
    $('img').remove();
    payload.signature = $.html();
  }

  // clear the expiration on user's avatar
  if (payload.avatar) {
    imageStore.clearExpiration(payload.avatar);
  }
}

function imagesSite(payload) {
  // clear the expiration on logo/favicon
  if (payload.website.logo) {
    imageStore.clearExpiration(payload.website.logo);
  }
  if (payload.website.favicon) {
    imageStore.clearExpiration(payload.website.favicon);
  }
}

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

function checkViewKey(key, redis) {
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

// -- API

exports.register = function(server, options, next) {
  options = options || {};
  options.methods = options.methods || [];

  // append hardcoded methods to the server
  var internalMethods = [
    // -- categories
    {
      name: 'common.categories.clean',
      method: categoriesClean,
      options: { callback: false }
    },
    // -- boards
    {
      name: 'common.boards.clean',
      method: boardsClean,
      options: { callback: false }
    },
    // -- users
    {
      name: 'common.users.clean',
      method: usersClean,
      options: { callback: false }
    },
    {
      name: 'common.users.parse',
      method: usersParse,
      options: { callback: false }
    },
    // -- posts
    {
      name: 'common.posts.clean',
      method: postsClean,
      options: { callback: false }
    },
    {
      name: 'common.posts.parse',
      method: postsParse,
      options: { callback: false }
    },
    // -- messages
    {
      name: 'common.messages.clean',
      method: messagesClean,
      options: { callback: false }
    },
    {
      name: 'common.messages.parse',
      method: messagesParse,
      options: { callback: false }
    },
    // -- images
    {
      name: 'common.images.sub',
      method: imagesSub,
      options: { callback: false }
    },
    {
      name: 'common.images.signature',
      method: imagesSignature,
      options: { callback: false }
    },
    {
      name: 'common.images.site',
      method: imagesSite,
      options: { callback: false }
    },
    // -- threads
    {
      name: 'common.threads.checkView',
      method: checkView,
      options: { callback: false }
    },
    {
      name: 'common.threads.updateView',
      method: updateView,
      options: { callback: false }
    },
  ];

  // append any new methods to methods from options
  var methods = [].concat(options.methods, internalMethods);
  server.method(methods);

  next();
};

exports.register.attributes = {
  name: 'common',
  version: '1.0.0'
};

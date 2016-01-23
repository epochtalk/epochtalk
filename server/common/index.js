var _ = require('lodash');
var path = require('path');
var uuid = require('node-uuid');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var bbcodeParser = require('epochtalk-bbcode-parser');
var config = require(path.normalize(__dirname + '/../../config'));
var imageStore = require(path.normalize(__dirname + '/../images'));
var sanitizer = require(path.normalize(__dirname + '/../sanitizer'));

module.exports = {
  cleanCategory: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    return reply();
  },
  cleanBoard: function(request, reply) {
    request.payload.name = sanitizer.strip(request.payload.name);
    if (request.payload.description) {
      request.payload.description = sanitizer.display(request.payload.description);
    }
    return reply();
  },
  cleanUser: function(request, reply) {
    var keys = ['username', 'email', 'name', 'website', 'btcAddress', 'gender', 'location', 'language', 'avatar', 'position'];
    keys.map(function(key) {
      if (request.payload[key]) {
        request.payload[key] = sanitizer.strip(request.payload[key]);
      }
    });

    var displayKeys = ['signature', 'raw_signature'];
    displayKeys.map(function(key) {
      if (request.payload[key]) {
        request.payload[key] = sanitizer.display(request.payload[key]);
      }
    });

    return reply();
  },
  cleanPost: function(request, reply) {
    request.payload.title = sanitizer.strip(request.payload.title);
    request.payload.raw_body = sanitizer.bbcode(request.payload.raw_body);
    return reply();
  },
  cleanMessage: function(request, reply) {
    request.payload.body = sanitizer.bbcode(request.payload.body);
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
      // convert all unicode characters to their numeric representation
      // this is so we can save it to the db and present it to any encoding
      raw_body = textToEntities(raw_body);

      // nothing to parse, just move raw_body to body
      request.payload.body = raw_body;
      request.payload.raw_body = '';
    }

    return reply();
  },
  parseMessage: function(request, reply) {
    var raw_body = request.payload.body;
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
      request.payload.body = bbcodeParser.process({text: raw_body}).html;
    }
    else { request.payload.body = textToEntities(raw_body); }

    return reply();
  },
  parseSignature: function(request, reply) {
    // check if raw_signature has any bbcode
    var raw_signature = request.payload.raw_signature;
    if (raw_signature && raw_signature.indexOf('[') >= 0) {
      // convert all &lt; and &gt; to decimal to escape the regex
      // in the bbcode parser that'll unescape those chars
      raw_signature = raw_signature.replace(/(?:\r\n|\r|\n)/g, '<br />');
      raw_signature = raw_signature.replace(/&gt;/g, '&#62;');
      raw_signature = raw_signature.replace(/&lt;/g, '&#60;');

      // parse raw_body to generate body
      var parsed = bbcodeParser.process({text: raw_signature}).html;
      request.payload.signature = parsed;
    }
    else if (raw_signature) {
      raw_signature = raw_signature.replace(/(?:\r\n|\r|\n)/g, '<br />');
      request.payload.signature = raw_signature;
    }
    else if (raw_signature === '') { request.payload.signature = ''; }

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
  },
  handleSignatureImages: function(request, reply) {
    // remove images in signature
    if (request.payload.signature) {
      var $ = cheerio.load(request.payload.signature);
      $('img').remove();
      request.payload.signature = $.html();
    }

    // clear the expiration on user's avatar
    if (request.payload.avatar) {
      imageStore.clearExpiration(request.payload.avatar);
    }

    return reply();
  },
  handleSiteImages: function(request, reply) {
    // clear the expiration on logo/favicon
    if (request.payload.website.logo) {
      imageStore.clearExpiration(request.payload.website.logo);
    }
    if (request.payload.website.favicon) {
      imageStore.clearExpiration(request.payload.website.favicon);
    }
    return reply();
  },
  getThread: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var promise = request.db.threads.find(threadId);
    return reply(promise);
  },
  checkViewValidity: function(request, reply) {
    var threadId = _.get(request, request.route.settings.app.thread_id);
    var viewerId = request.headers['epoch-viewer'];
    var newViewerId = '';

    // Check if viewerId and threadId is found
    var viewerIdKey = viewerId + threadId;
    var promise = checkViewKey(viewerIdKey, request.redis)
    .then(function(valid) { // viewId found
      if (valid) { return request.db.threads.incViewCount(threadId); }
    })
    .catch(function() { // viewId not found
      // save this viewerId to redis
      if (viewerId) { request.redis.setAsync(viewerIdKey, Date.now()); }
      // create new viewerId and save to redis
      else {
        newViewerId = uuid.v4();
        request.redis.setAsync(newViewerId + threadId, Date.now());
      }

      // Check if ip address and threadId is found
      var viewerAddress = request.info.remoteAddress;
      var addressKey = viewerAddress + threadId;
      return checkViewKey(addressKey, request.redis)
      .then(function(valid) { // address found
        if (valid) { return request.db.threads.incViewCount(threadId); }
      })
      .catch(function() { // address not found
        // save this address + threadId combo to redis
        request.redis.setAsync(addressKey, Date.now());
        // increment view count
        return request.db.threads.incViewCount(threadId);
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
    var promise = request.db.users.putUserThreadViews(userId, threadId);
    return reply(promise);
  },
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

var path = require('path');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));
var Hapi = require('hapi');
var Boom = require('boom');
var cheerio = require('cheerio');
var bbcodeParser = require('epochtalk-bbcode-parser');
var Promise = require('bluebird');
var config = require(path.join(__dirname, '..', '..', '..', 'config'));
var imageProxy = require(path.join(__dirname, '..', '..', '..', 'images'));
var sanitizer = require(path.join(__dirname, '..', '..', '..', 'sanitizer'));

module.exports = {
  authPost: function(request, reply) {
    var userId = request.auth.credentials.id;
    var postId = request.params.id;

    db.posts.find(postId)
    .then(function(post) {
      var authError;

      if (post.user_id !== userId) {
        authError = Boom.badRequest('User did not create this post.');
      }

      return reply(authError);
    })
    .catch(function() {
      var error = Boom.badRequest('Post Not Found');
      return reply(error);
    });
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
    // check if raw_body has any bbcode
    if (request.payload.raw_body.indexOf('[') >= 0) {
      // convert all &lt; and &gt; to decimal to escape the regex
      // in the bbcode parser that'll unescape those chars
      request.payload.raw_body = request.payload.raw_body.replace(/&gt;/g, '&#62;');
      request.payload.raw_body = request.payload.raw_body.replace(/&lt;/g, '&#60;');

      // parse raw_body to generate body
      var parsedBody = bbcodeParser.process({text: request.payload.raw_body}).html;
      request.payload.body = parsedBody;

      // check if parsing was needed
      if (parsedBody === request.payload.raw_body) {
        // it wasn't need so remove raw_body
        request.payload.raw_body = null;
      }
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

    // convert each image's src to proxy version
    return Promise.map(images, function(element) {
      // get image src
      var src = $(element).attr('src');

      // if image already in proxy form, skip
      if (config.cdnUrl && src.indexOf(config.cdnUrl) === 0) {
        // clear this image from the imageProxy expiry
        imageProxy.clearExpiration(src);
        return;
      }

      // get new hotlinkedUrl from proxy
      var proxyUrl = imageProxy.hotlinkedUrl(src);

      if (src !== proxyUrl) {
        // move original src to data-canonical-src
        $(element).attr('data-canonical-src', src);
      }

      // update src with new url
      $(element).attr('src', proxyUrl);
    })
    .then(function() {
      request.payload.body = $.html();
      return reply();
    })
    .catch(function(err) { return reply(err); });
  }
};

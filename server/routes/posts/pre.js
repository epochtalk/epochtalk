var core = require('epochcore')();
var Hapi = require('hapi');
var cheerio = require('cheerio');
var bbcodeParser = require('bbcode-parser');
var Promise = require('bluebird');
var path = require('path');
var config = require(path.join(__dirname, '..', '..', 'config'));
var cdn = require(path.join(__dirname, '..', '..', 'image-cdn'));
var sanitize = require(path.join(__dirname, '..', '..', 'sanitize'));

module.exports = {
  authPost: function(request, reply) {
    var userId = request.auth.credentials.id;
    var postId = request.params.id;

    core.posts.find(postId)
    .then(function(post) {
      var authError;

      if (post.user_id !== userId) {
        authError = Hapi.error.badRequest('User did not create this post.');
      }

      return reply(authError);
    })
    .catch(function() {
      var error = Hapi.error.badRequest('Post Not Found');
      return reply(error);
    });
  },
  clean: function(request, reply) {
    request.payload.title = sanitize.strip(request.payload.title);
    request.payload.encodedBody = sanitize.bbcode(request.payload.encodedBody);
    return reply();
  },
  parseEncodings: function(request, reply) {
    // check if encodedBody has any bbcode
    if (request.payload.encodedBody.indexOf('[') >= 0) {
      // convert all &lt; and &gt; to decimal to escape the regex
      // in the bbcode parser that'll unescape those chars
      request.payload.encodedBody = request.payload.encodedBody.replace(/&gt;/g, '&#62;');
      request.payload.encodedBody = request.payload.encodedBody.replace(/&lt;/g, '&#60;');

      // parse encodedBody to generate body
      var parsedBody = bbcodeParser.process({text: request.payload.encodedBody}).html;
      request.payload.body = parsedBody;

      // check if parsing was needed
      if (parsedBody === request.payload.encodedBody) {
        // it wasn't need so remove encodedBody
        request.payload.encodedBody = null;
      }
    }
    else {
      // nothing to parse, just move encodedBody to body
      request.payload.body = request.payload.encodedBody;
      request.payload.encodedBody = null;
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
      // get image src
      var src = $(element).attr('src');

      // if image already in cdn, skip
      if (config.cdnUrl && src.indexOf(config.cdnUrl) === 0) { return; }

      // get new url from cdn
      var cdnUrl = cdn.url(src);

      if (src !== cdnUrl) {
        // move original src to data-canonical-src
        $(element).attr('data-canonical-src', src);
      }

      // update src with new url
      $(element).attr('src', cdnUrl);
    })
    .then(function() {
      request.payload.body = $.html();
      return reply();
    })
    .catch(function(err) { return reply(err); });
  }
};

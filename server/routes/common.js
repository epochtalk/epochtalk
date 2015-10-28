var path = require('path');
var cheerio = require('cheerio');
var bbcodeParser = require('epochtalk-bbcode-parser');
var sanitizer = require(path.normalize(__dirname + '/../sanitizer'));
var imageStore = require(path.normalize(__dirname + '/../images'));

module.exports = {
  users: {
    clean: function(request, reply) {
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
    handleImages: function(request, reply) {
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
    }
  }
};

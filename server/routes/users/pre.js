var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var cheerio = require('cheerio');
var bbcodeParser = require('epochtalk-bbcode-parser');
var db = require(path.normalize(__dirname + '/../../../db'));
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));
var imageStore = require(path.normalize(__dirname + '/../../images'));
var config = require(path.normalize(__dirname + '/../../../config'));

module.exports = {
  getCurrentUser: function(request, reply) {
    db.users.find(request.auth.credentials.id)
    .then(function(user) {
      if (user) { return reply(user); }
      else { return Boom.badRequest('User Not Found'); }
    })
    .catch(function(err) { return reply(err); });
  },
  checkUsernameUniqueness: function(request, reply) {
    if (!request.payload.username) { return reply(); }

    var userId = request.auth.credentials.id;
    db.users.find(userId)
    .then(function(user) {
      // check if username has changed
      if (user.username === request.payload.username) { return reply(); }
      else {
        // check that new username is unique
        var newUsername = request.payload.username;
        db.users.userByUsername(newUsername)
        .then(function(user) {
          if (user) {
            var usernameError = Boom.badRequest('Username Already Exists');
            return reply(usernameError);
          }
          else { return reply(); }
        })
        .catch(function(err) { return reply(err); });
      }
    });
  },
  checkEmailUniqueness: function(request, reply) {
    if (!request.payload.email) { return reply(); }

    var userId = request.auth.credentials.id;
    db.users.find(userId)
    .then(function(user) {
      // check if email has changed
      if (user.email === request.payload.email) { return reply(); }
      else {
        // check that new email is unique
        var newEmail = request.payload.email;
        db.users.userByEmail(newEmail)
        .then(function(user) {
          if (user) {
            var emailError = Boom.badRequest('Email Already Exists');
            return reply(emailError);
          }
          else { return reply(); }
        })
        .catch(function(err) { return reply(err); });
      }
    });
  },
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
    var signature = request.payload.signature;
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
};

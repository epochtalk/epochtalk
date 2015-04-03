var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var cheerio = require('cheerio');
var db = require(path.normalize(__dirname + '/../../../db'));
var bbcodeParser = require('epochtalk-bbcode-parser');
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));
var imageStore = require(path.normalize(__dirname + '/../../images'));
var config = require(path.normalize(__dirname + '/../../../config'));

module.exports = {
  getCurrentUser: function(request, reply) {
    // get user id from auth
    var userId = request.auth.credentials.id;
    db.users.find(userId)
    .then(function(user) { return reply(user); })
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
  parseSignature: function(request, reply) {
    // check if signature has any bbcode
    var signature = request.payload.signature;
    if (signature && signature.indexOf('[') >= 0) {
      // convert all &lt; and &gt; to decimal to escape the regex
      // in the bbcode parser that'll unescape those chars
      signature = signature.replace(/&gt;/g, '&#62;');
      signature = signature.replace(/&lt;/g, '&#60;');

      // parse raw_body to generate body
      var parsed = bbcodeParser.process({text: signature}).html;
      request.payload.signature = parsed;
    }
    return reply();
  },
  clean: function(request, reply) {
    if (request.payload.username) {
      request.payload.username = sanitizer.strip(request.payload.username);
    }
    if (request.payload.email) {
      request.payload.email = sanitizer.strip(request.payload.email);
    }
    if (request.payload.name) {
      request.payload.name = sanitizer.strip(request.payload.name);
    }
    if (request.payload.website) {
      request.payload.website = sanitizer.strip(request.payload.website);
    }
    if (request.payload.btcAddress) {
      request.payload.btcAddress = sanitizer.strip(request.payload.btcAddress);
    }
    if (request.payload.gender) {
      request.payload.gender = sanitizer.strip(request.payload.gender);
    }
    if (request.payload.location) {
      request.payload.location = sanitizer.strip(request.payload.location);
    }
    if (request.payload.language) {
      request.payload.language = sanitizer.strip(request.payload.language);
    }
    if (request.payload.signature) {
      request.payload.signature = sanitizer.display(request.payload.signature);
    }
    if (request.payload.avatar) {
      request.payload.avatar = sanitizer.strip(request.payload.avatar);
    }
    if (request.payload.position) {
      request.payload.position = sanitizer.strip(request.payload.position);
    }
    if (request.payload.reset_token) {
      request.payload.reset_token = sanitizer.strip(request.payload.reset_token);
    }
    if (request.payload.reset_expiration) {
      request.payload.reset_expiration = sanitizer.strip(request.payload.reset_expiration);
    }
    if (request.payload.confirmation_token) {
      request.payload.confirmation_token = sanitizer.strip(request.payload.confirmation_token);
    }
    return reply();
  },
  removeImages: function(request, reply) {
    // load html in user.signature into cheerio
    var html = request.payload.signature;
    var $ = cheerio.load(html);
    $('img').remove();
    var parsed = $.html();
    request.payload.signature = parsed.replace(/\r\n|\r|\n/g,'<br />');

    // clear user.avatar image upload
    var url = request.payload.avatar;
    imageStore.clearExpiration(url);
    return reply();
  }
};

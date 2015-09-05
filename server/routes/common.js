var path = require('path');
var cheerio = require('cheerio');
var Boom = require('boom');
var Promise = require('bluebird');
var bbcodeParser = require('epochtalk-bbcode-parser');
var sanitizer = require(path.normalize(__dirname + '/../sanitizer'));
var imageStore = require(path.normalize(__dirname + '/../images'));
var db = require(path.normalize(__dirname + '/../../db'));
var USER_ROLES = require(path.normalize(__dirname + '/user-roles'));
var querystring = require('querystring');

module.exports = {
  auth: {
    isAdmin: isAdmin,
    isMod: isMod,
    adminCheck: function(request, reply) {
      if (request.auth.isAuthenticated) {
        var username = querystring.unescape(request.auth.credentials.username);
        return db.users.userByUsername(username)
        .then(function(user) {
          var isAdmin = false;
          user.roles.forEach(function(role) {
            if (role.name === USER_ROLES.admin || role.name === USER_ROLES.superAdmin) { isAdmin = true; }
          });
          return reply(isAdmin || Boom.unauthorized());
        })
        .catch(function() { return reply(Boom.unauthorized()); });
      }
      else { return reply(Boom.unauthorized()); }
    },
    modCheck: function(request, reply) {
      if (request.auth.isAuthenticated) {
        var username = querystring.unescape(request.auth.credentials.username);
        return db.users.userByUsername(username)
        .then(function(user) {
          var isMod = false;
          var isAdmin = false;
          user.roles.forEach(function(role) {
            if (role.name === USER_ROLES.mod || role.name === USER_ROLES.globalMod) { isMod = true; }
            if (role.name === USER_ROLES.admin || role.name === USER_ROLES.superAdmin) { isAdmin = true; }
          });
          if (isMod) { return reply(true); }
          else if (isAdmin) { return reply(false); } // Admin is not unauthorized, fall through to adminCheck
          else { return reply(Boom.unauthorized()); }
        })
        .catch(function() { return reply(Boom.unauthorized()); });
      }
      else { return reply(Boom.unauthorized()); }
    }
  },
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

function isAdmin(authenticated, username) {
  var promise;
  var admin = false;

  if (!authenticated) { promise = Promise.resolve(admin); }
  else {
    username = querystring.unescape(username);
    promise = db.users.userByUsername(username)
    .then(function(user) {
      user.roles.forEach(function(role) {
        if (role.name === USER_ROLES.admin) { admin = true; }
        else if (role.name === USER_ROLES.superAdmin) { admin = true; }
      });
      return admin;
    });
  }

  return promise;
}

function isMod(authenticated, username) {
  var promise;
  var mod = false;

  if (!authenticated) { promise = Promise.resolve(mod); }
  else {
    username = querystring.unescape(username);
    return db.users.userByUsername(username)
    .then(function(user) {
      user.roles.forEach(function(role) {
        if (role.name === USER_ROLES.mod) { mod = true; }
        else if (role.name === USER_ROLES.globalMod) { mod = true; }
      });
      return mod;
    });
  }

  return promise;
}

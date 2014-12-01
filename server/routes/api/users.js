var core = require('epochcore')();
var Hapi = require('hapi');
var bbcodeParser = require('bbcode-parser');
var userValidator = require('epoch-validator').api.users;
var path = require('path');
var sanitize = require(path.join('..', '..', 'sanitize'));

// Pre
var pre = {
  getCurrentUser: function(request, reply) {
    // get user id from auth
    var userId = request.auth.credentials.id;
    core.users.find(userId)
    .then(function(user) { return reply(user); })
    .catch(function(err) { return reply(err); });
  },
  checkUsernameUniqueness: function(request, reply) {
    if (!request.payload.username) { return reply(); }

    var userId = request.auth.credentials.id;
    core.users.find(userId)
    .then(function(user) {
      // check if username has changed
      if (user.username === request.payload.username) { return reply(); }
      else {
        // check that new username is unique
        var newUsername = request.payload.username;
        core.users.userByUsername(newUsername)
        .then(function() {
          // throw error
          var usernameError = Hapi.error.badRequest('Username Already Exists');
          return reply(usernameError);
        })
        .catch(function() { return reply(); });
      }
    });
  },
  checkEmailUniqueness: function(request, reply) {
    if (!request.payload.email) { return reply(); }

    var userId = request.auth.credentials.id;
    core.users.find(userId)
    .then(function(user) {
      // check if email has changed
      if (user.email === request.payload.email) { return reply(); }
      else {
        // check that new email is unique
        var newEmail = request.payload.email;
        core.users.userByEmail(newEmail)
        .then(function() {
          // throw Error
          var emailError = Hapi.error.badRequest('Email Already Exists');
          return reply(emailError);
        })
        .catch(function() { return reply(); });
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

      // parse encodedBody to generate body
      var parsed = bbcodeParser.process({text: signature}).html;
      request.payload.signature = parsed;
    }
    return reply();
  },
  clean: function(request, reply) {
    if (request.payload.username) {
      request.payload.username = sanitize.strip(request.payload.username);
    }
    if (request.payload.email) {
      request.payload.email = sanitize.strip(request.payload.email);
    }
    if (request.payload.name) {
      request.payload.name = sanitize.strip(request.payload.name);
    }
    if (request.payload.website) {
      request.payload.website = sanitize.strip(request.payload.website);
    }
    if (request.payload.btcAddress) {
      request.payload.btcAddress = sanitize.strip(request.payload.btcAddress);
    }
    if (request.payload.gender) {
      request.payload.gender = sanitize.strip(request.payload.gender);
    }
    if (request.payload.location) {
      request.payload.location = sanitize.strip(request.payload.location);
    }
    if (request.payload.language) {
      request.payload.language = sanitize.strip(request.payload.language);
    }
    if (request.payload.signature) {
      request.payload.signature = sanitize.bbcode(request.payload.signature);
    }
    if (request.payload.avatar) {
      request.payload.avatar = sanitize.strip(request.payload.avatar);
    }
    if (request.payload.reset_token) {
      request.payload.reset_token = sanitize.strip(request.payload.reset_token);
    }
    if (request.payload.reset_expiration) {
      request.payload.reset_expiration = sanitize.strip(request.payload.reset_expiration);
    }
    if (request.payload.confirmation_token) {
      request.payload.confirmation_token = sanitize.strip(request.payload.confirmation_token);
    }
    return reply();
  }
};

// Route handlers/configs
var users = {};
users.create = {
  validate: { payload: userValidator.schema.create },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    core.users.create(request.payload)
    .then(function(user) {
      delete user.passhash;
      reply(user);
    })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

users.import = {
  // auth: { strategy: 'jwt' },
  validate: { payload: userValidator.schema.import },
  pre: [
    { method: pre.clean },
    { method: pre.parseSignature }
  ],
  handler: function(request, reply) {
    core.users.import(request.payload)
    .then(function(user) {
      delete user.passhash;
      reply(user);
    })
    .catch(function(err) { reply(err); });
  }
};

users.update = {
  auth: { strategy: 'jwt' },
  validate: { payload: userValidator.schema.update },
  pre: [
    [
      { method: pre.getCurrentUser, assign: 'currentUser' },
      { method: pre.checkUsernameUniqueness },
      { method: pre.checkEmailUniqueness }
    ],
    { method: pre.clean },
    { method: pre.parseSignature }
  ],
  handler: function(request, reply) {
    // get user
    var user = request.pre.currentUser;

    // build the user object from payload and params
    var updateUser = { id: user.id };
    if (request.payload.username) {
      updateUser.username = request.payload.username;
    }
    if (request.payload.email) {
      updateUser.email = request.payload.email;
    }
    if (request.payload.password && request.payload.confirmation) {
      updateUser.password = request.payload.password;
      updateUser.confirmation = request.payload.confirmation;
    }
    if (request.payload.name) {
      updateUser.name = request.payload.name;
    }
    if (request.payload.website) {
      updateUser.website = request.payload.website;
    }
    if (request.payload.btcAddress) {
      updateUser.btcAddress = request.payload.btcAddress;
    }
    if (request.payload.gender) {
      updateUser.gender = request.payload.gender;
    }
    if (request.payload.dob) {
      updateUser.dob = request.payload.dob;
    }
    if (request.payload.location) {
      updateUser.location = request.payload.location;
    }
    if (request.payload.language) {
      updateUser.language = request.payload.language;
    }
    if (request.payload.signature) {
      updateUser.signature = request.payload.signature;
    }
    if (request.payload.avatar) {
      updateUser.avatar = request.payload.avatar;
    }

    // create the thread in core
    core.users.update(updateUser)
    .then(function(user) {
      delete user.passhash;
      user.editable = true;
      reply(user);
    })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

users.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    // get logged in user
    var authUser = {};
    if (request.auth.isAuthenticated) {
      authUser = request.auth.credentials;
    }
    // get user by username
    var username = request.params.id;
    core.users.userByUsername(username)
    .then(function(user) {
      delete user.passhash;
      if (authUser.id === user.id) { user.editable = true; }
      return user;
    })
    .then(function(user) { reply(user); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

// Export Routes/Pre
exports.routes = [
  { method: 'POST', path: '/users', config: users.create },
  { method: 'GET', path: '/users/{id}', config: users.find },
  { method: 'PUT', path: '/users', config: users.update },
  // POST IMPORT
  { method: 'POST', path: '/users/import', config: users.import }
];

exports.pre = pre;
